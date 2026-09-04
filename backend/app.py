from flask import Flask,request,jsonify
from flask_cors import CORS
import sqlite3
import numpy as np
from services.customer_analyzer import analyze_customer
from services.risk_detector import detect_revenue_risk
from services.decision_agent import get_decision
from services.recovery_simulator import recovery_simulator
from services.llm_service import generate_recovery_content
from services.recovery_tracker import track_recovery

app=Flask(__name__)
CORS(app)
DB_NAME=r"C:\Users\RADHAGOPINATH\recovery_revenue.db"

def make_json_serializable(obj):
    if isinstance(obj, dict):
        return {
            key: make_json_serializable(value)
            for key, value in obj.items()
        }

    if isinstance(obj, list):
        return [
            make_json_serializable(value)
            for value in obj
        ]

    if isinstance(obj, np.integer):
        return int(obj)

    if isinstance(obj, np.floating):
        return float(obj)

    if isinstance(obj, np.bool_):
        return bool(obj)

    return obj

@app.route("/")
def main_page():
    return "Hello from main_page"

@app.route("/api/events",methods=['POST'])
def event_page():
    result=request.get_json()
    if not result:
        return jsonify({
            "error": "No JSON data provided"
        }), 400
    if "transaction_id" not in result:
        return jsonify({
            "error": "transaction_id is required"
        }), 400
    if "customer_id" not in result:
        return jsonify({
            "error": "customer_id is required"
        }), 400
    
    transaction_id=result["transaction_id"]
    customer_id = result["customer_id"]

    # Check transaction exists
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM transactions WHERE transac_id = ?",
        (transaction_id,)
    )
    transaction = cursor.fetchone()
    if transaction is None:
        conn.close()
        return jsonify({
            "error": "Transaction not found"
        }), 404

    # Check customer exists
    cursor.execute(
        "SELECT * FROM customer WHERE cust_id = ?",
        (customer_id,)
    )
    customer = cursor.fetchone()
    conn.close()
    if customer is None:
        return jsonify({
            "error": "Customer not found"
        }), 404

    risk_result=detect_revenue_risk(transaction_id)
    customer_result=analyze_customer(customer_id,transaction_id)
    decision_result = get_decision(transaction_id, customer_id)

    llm_result = generate_recovery_content(decision_result)

    return jsonify({
        "decision": decision_result,
        "generated_content": llm_result
    }), 200

@app.route("/api/recovery/<int:transaction_id>/execute", methods=["POST"])
def execute_recovery(transaction_id):

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Find transaction
    cursor.execute(
        "SELECT * FROM transactions WHERE transac_id = ?",
        (transaction_id,)
    )

    transaction = cursor.fetchone()

    conn.close()

    if transaction is None:
        return jsonify({
            "error": "Transaction not found"
        }), 404

    # Get customer belonging to transaction
    customer_id = transaction["customer_id"]

    # Decide recovery action
    decision_result = get_decision(
        transaction_id,
        customer_id
    )

    # Generate customer-facing AI message
    llm_result = generate_recovery_content(
        decision_result
    )

    # Extract values needed by recovery simulator
    action = decision_result["action"]
    original_revenue = decision_result["amount"]
    recoverability = decision_result["recoverability"]
    customer_value = decision_result["customer_value"]
    customer_type = decision_result["customer_type"]

    # Execute simulated recovery
    recovery_result = recovery_simulator(
        transaction_id,
        action,
        original_revenue,
        recoverability,
        customer_value,
        customer_type
    )

    tracking_created = track_recovery(recovery_result)

    return jsonify({
        "decision": decision_result,
        "generated_content": llm_result,
        "recovery": recovery_result,
        "tracking_created": tracking_created
    }), 200

@app.route("/api/transactions", methods=["GET"])
def get_transactions():

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            t.*,
            r.success AS recovery_success,
            r.simulation_result,
            r.revenue_recovered
        FROM transactions t
        LEFT JOIN recovery_tracking r
            ON t.transac_id = r.transaction_id
        ORDER BY t.timestamp DESC
    """)

    rows = cursor.fetchall()

    transactions = []

    for row in rows:
        transaction = dict(row)

        risk_result = detect_revenue_risk(
            transaction["transac_id"]
        )

        transaction["risk_level"] = (
            risk_result.get("risk_level")
            if risk_result
            else None
        )

        transactions.append(transaction)

    conn.close()

    return jsonify({
        "transactions": transactions,
        "count": len(transactions)
    }), 200

@app.route("/api/transactions/<int:transaction_id>", methods=["GET"])
def get_transaction_detail(transaction_id):

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM transactions WHERE transac_id = ?",
        (transaction_id,)
    )

    row = cursor.fetchone()

    if not row:
        conn.close()
        return jsonify({"error": "Transaction not found"}), 404

    transaction = dict(row)

    customer_id = transaction["customer_id"]

    risk_result = detect_revenue_risk(transaction_id)

    customer_result = analyze_customer(
        customer_id,
        transaction_id
    )

    # IMPORTANT: use the same call that already works elsewhere
    decision_result = get_decision(
        transaction_id,
        customer_id
    )

    cursor.execute("""
        SELECT *
        FROM recovery_tracking
        WHERE transaction_id = ?
    """, (transaction_id,))

    recovery_row = cursor.fetchone()

    recovery = dict(recovery_row) if recovery_row else None

    conn.close()

    response_data = {
    "transaction": transaction,
    "risk_analysis": risk_result,
    "customer_analysis": customer_result,
    "decision": decision_result,
    "recovery": recovery
}

    response_data = make_json_serializable(response_data)

    return jsonify(response_data), 200

@app.route("/api/customers", methods=["GET"])
def get_customers():

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get all customers
    cursor.execute("""
        SELECT *
        FROM customer
        ORDER BY cust_id
    """)

    customer_rows = cursor.fetchall()

    customers = []

    for row in customer_rows:

        customer = dict(row)
        customer_id = customer["cust_id"]

        # Get all transactions belonging to this customer
        cursor.execute("""
            SELECT *
            FROM transactions
            WHERE customer_id = ?
        """, (customer_id,))

        transaction_rows = cursor.fetchall()

        revenue_at_risk = 0

        for transaction_row in transaction_rows:

            transaction = dict(transaction_row)

            if transaction["event_type"] == "PAYMENT_FAILED":
                revenue_at_risk += transaction["amount"] or 0

            elif transaction["event_type"] == "CHECKOUT_ABANDONED":
                revenue_at_risk += transaction["cart_value"] or 0

        # Calculate how much revenue was actually recovered
        cursor.execute("""
            SELECT COALESCE(SUM(r.revenue_recovered), 0)
            FROM recovery_tracking r
            JOIN transactions t
                ON r.transaction_id = t.transac_id
            WHERE t.customer_id = ?
        """, (customer_id,))

        recovered = cursor.fetchone()[0]

        # Use the same customer analysis logic as the rest of the project.
        # We only need the CLV classification here.
        clv = customer["clv"]

        if clv < 9000:
            customer_value = "LOW"
        elif clv < 70000:
            customer_value = "MEDIUM"
        else:
            customer_value = "HIGH"

        customer["customer_value"] = customer_value
        customer["revenue_at_risk"] = revenue_at_risk
        customer["recovered"] = recovered

        customers.append(customer)

    conn.close()

    return jsonify({
        "customers": make_json_serializable(customers),
        "count": len(customers)
    }), 200

if __name__=='__main__':
    app.run(debug=True)