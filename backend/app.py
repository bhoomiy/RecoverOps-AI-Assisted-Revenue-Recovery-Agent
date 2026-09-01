from flask import Flask,request,jsonify
import sqlite3
from services.customer_analyzer import analyze_customer
from services.risk_detector import detect_revenue_risk
from services.decision_agent import get_decision
from services.recovery_simulator import recovery_simulator

app=Flask(__name__)
DB_NAME=r"C:\Users\RADHAGOPINATH\recovery_revenue.db"

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
    decision_result=get_decision(transaction_id,customer_id)
    return jsonify(decision_result),200

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

    # Ask decision agent what intervention should happen
    decision_result = get_decision(
        transaction_id,
        customer_id
    )

    # Extract values needed by recovery simulator
    action = decision_result["action"]
    original_revenue = decision_result["amount"]
    recoverability = decision_result["recoverability"]
    customer_value = decision_result["customer_value"]
    customer_type = decision_result["customer_type"]

    # Execute simulated recovery
    recovery_result = recovery_simulator(transaction_id,action,original_revenue,recoverability,customer_value,customer_type)
    return jsonify(recovery_result), 200



if __name__=='__main__':
    app.run(debug=True)