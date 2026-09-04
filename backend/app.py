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

@app.route("/api/recoveries", methods=["GET"])
def get_recoveries():

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            t.*,
            r.success AS recovery_success,
            r.simulation_result,
            r.revenue_recovered,
            r.revenue_lost,
            r.action_taken,
            r.reason AS recovery_reason,
            r.timestamp AS recovery_timestamp
        FROM transactions t
        LEFT JOIN recovery_tracking r
            ON t.transac_id = r.transaction_id
        WHERE t.event_type IN (
            'PAYMENT_FAILED',
            'CHECKOUT_ABANDONED'
        )
        ORDER BY t.timestamp DESC
    """)

    rows = cursor.fetchall()

    recoveries = []

    for row in rows:
        item = dict(row)

        transaction_id = item["transac_id"]
        customer_id = item["customer_id"]

        risk_result = detect_revenue_risk(transaction_id)

        decision_result = get_decision(
            transaction_id,
            customer_id
        )

        if item["recovery_success"] == 1:
            status = "RECOVERED"

        elif item["recovery_success"] == 0:
            status = "FAILED"

        else:
            status = "NEEDS_RECOVERY"

        amount_at_risk = (
            item["cart_value"]
            if item["event_type"] == "CHECKOUT_ABANDONED"
            else item["amount"]
        )

        recoveries.append({
            "id": transaction_id,
            "customer_id": customer_id,
            "event_type": item["event_type"],
            "amount_at_risk": amount_at_risk,
            "failure_reason": item["failure_reason"],
            "timestamp": item["timestamp"],
            "risk_level": (
                risk_result.get("risk_level")
                if risk_result
                else None
            ),
            "status": status,
            "recommended_action": (
                decision_result.get("action")
                if decision_result
                else None
            ),
            "priority": (
                decision_result.get("priority")
                if decision_result
                else None
            ),
            "recovery_success": item["recovery_success"],
            "simulation_result": item["simulation_result"],
            "revenue_recovered": item["revenue_recovered"] or 0,
            "revenue_lost": item["revenue_lost"] or 0
        })

    conn.close()

    metrics = {
        "needs_recovery": sum(
            1 for r in recoveries
            if r["status"] == "NEEDS_RECOVERY"
        ),
        "in_progress": 0,
        "recovered": sum(
            1 for r in recoveries
            if r["status"] == "RECOVERED"
        ),
        "failed": sum(
            1 for r in recoveries
            if r["status"] == "FAILED"
        )
    }

    return jsonify(
        make_json_serializable({
            "recoveries": recoveries,
            "metrics": metrics,
            "count": len(recoveries)
        })
    ), 200

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # ---------------------------------------
        # Revenue at risk
        # ---------------------------------------

        cursor.execute("""
            SELECT
                SUM(
                    CASE
                        WHEN event_type = 'PAYMENT_FAILED'
                            THEN amount

                        WHEN event_type = 'CHECKOUT_ABANDONED'
                            THEN cart_value

                        ELSE 0
                    END
                ) AS total_revenue_at_risk
            FROM transactions
            WHERE event_type IN (
                'PAYMENT_FAILED',
                'CHECKOUT_ABANDONED'
            )
        """)

        risk_row = cursor.fetchone()

        total_revenue_at_risk = (
            risk_row["total_revenue_at_risk"] or 0
        )

        # ---------------------------------------
        # Recovery statistics
        # ---------------------------------------

        cursor.execute("""
            SELECT
                COALESCE(SUM(revenue_recovered), 0)
                    AS revenue_recovered,

                SUM(
                    CASE
                        WHEN success = 1 THEN 1
                        ELSE 0
                    END
                ) AS successful_recoveries,

                SUM(
                    CASE
                        WHEN success = 0 THEN 1
                        ELSE 0
                    END
                ) AS failed_recoveries,

                COUNT(*) AS recovery_attempts

            FROM recovery_tracking
        """)

        recovery_row = cursor.fetchone()

        revenue_recovered = (
            recovery_row["revenue_recovered"] or 0
        )

        successful_recoveries = (
            recovery_row["successful_recoveries"] or 0
        )

        failed_recoveries = (
            recovery_row["failed_recoveries"] or 0
        )

        recovery_attempts = (
            recovery_row["recovery_attempts"] or 0
        )

        # ---------------------------------------
        # Recovery rate
        # ---------------------------------------

        if recovery_attempts > 0:
            recovery_rate = (
                successful_recoveries
                / recovery_attempts
            ) * 100
        else:
            recovery_rate = 0

        # ---------------------------------------
        # Transactions still needing recovery
        # ---------------------------------------

        cursor.execute("""
            SELECT COUNT(*) AS needs_recovery
            FROM transactions t

            LEFT JOIN recovery_tracking r
                ON t.transac_id = r.transaction_id

            WHERE
                t.event_type IN (
                    'PAYMENT_FAILED',
                    'CHECKOUT_ABANDONED'
                )

                AND r.transaction_id IS NULL
        """)

        needs_row = cursor.fetchone()

        needs_recovery = (
            needs_row["needs_recovery"] or 0
        )

        # ---------------------------------------
        # Risk distribution
        # ---------------------------------------

        risk_counts = {
            "LOW": 0,
            "MEDIUM": 0,
            "HIGH": 0
        }

        cursor.execute("""
            SELECT transac_id
            FROM transactions
            WHERE event_type IN (
                'PAYMENT_FAILED',
                'CHECKOUT_ABANDONED'
            )
        """)

        risky_transactions = cursor.fetchall()

        for row in risky_transactions:
            risk_result = detect_revenue_risk(
                row["transac_id"]
            )

            risk_level = risk_result.get("risk_level")

            if risk_level in risk_counts:
                risk_counts[risk_level] += 1


        total_risky_events = sum(risk_counts.values())

        risk_distribution = []

        for level in ["HIGH", "MEDIUM", "LOW"]:
            count = risk_counts[level]

            percentage = (
                round((count / total_risky_events) * 100, 1)
                if total_risky_events > 0
                else 0
            )

            risk_distribution.append({
                "name": level,
                "value": percentage,
                "count": count
            })

        # ---------------------------------------
        # 30 day revenue trend
        # ---------------------------------------

        cursor.execute("""
            SELECT
                DATE(t.timestamp) AS day,

                SUM(
                    CASE
                        WHEN t.event_type = 'PAYMENT_FAILED'
                            THEN t.amount

                        WHEN t.event_type = 'CHECKOUT_ABANDONED'
                            THEN t.cart_value

                        ELSE 0
                    END
                ) AS risk,

                COALESCE(
                    SUM(r.revenue_recovered),
                    0
                ) AS recovered,

                COALESCE(
                    SUM(r.revenue_lost),
                    0
                ) AS lost

            FROM transactions t

            LEFT JOIN recovery_tracking r
                ON t.transac_id = r.transaction_id

            WHERE
                t.event_type IN (
                    'PAYMENT_FAILED',
                    'CHECKOUT_ABANDONED'
                )

                AND DATE(t.timestamp) >= DATE('now', '-29 days')

            GROUP BY DATE(t.timestamp)

            ORDER BY DATE(t.timestamp)
        """)

        trend_rows = cursor.fetchall()

        revenue_trend = []

        for row in trend_rows:
            revenue_trend.append({
                "name": row["day"],
                "risk": row["risk"] or 0,
                "recovered": row["recovered"] or 0,
                "lost": row["lost"] or 0
            })

        # ---------------------------------------
        # Recent recovery activity
        # ---------------------------------------

        cursor.execute("""
            SELECT
                t.transac_id,
                t.customer_id,
                t.event_type,
                t.amount,
                t.cart_value,
                t.failure_reason,
                t.timestamp,

                r.success AS recovery_success,
                r.action_taken,
                r.simulation_result

            FROM transactions t

            LEFT JOIN recovery_tracking r
                ON t.transac_id = r.transaction_id

            WHERE
                t.event_type IN (
                    'PAYMENT_FAILED',
                    'CHECKOUT_ABANDONED'
                )

            ORDER BY datetime(t.timestamp) DESC

            LIMIT 5
        """)

        activity_rows = cursor.fetchall()

        recent_activity = []

        for row in activity_rows:

            transaction_id = row["transac_id"]

            risk_result = detect_revenue_risk(
                transaction_id
            )

            if row["recovery_success"] == 1:
                status = "RECOVERED"

            elif row["recovery_success"] == 0:
                status = "FAILED"

            else:
                status = "NEEDS_RECOVERY"

            amount_at_risk = (
                row["cart_value"]
                if row["event_type"] == "CHECKOUT_ABANDONED"
                else row["amount"]
            )

            recent_activity.append({
                "id": transaction_id,
                "customer_id": row["customer_id"],
                "event_type": row["event_type"],
                "amount": amount_at_risk,
                "failure_reason": row["failure_reason"],
                "timestamp": row["timestamp"],
                "risk_level": risk_result.get(
                    "risk_level"
                ),
                "status": status,
                "action": row["action_taken"]
            })

        conn.close()

        result = {
            "revenue_at_risk": total_revenue_at_risk,
            "revenue_recovered": revenue_recovered,
            "recovery_rate": round(recovery_rate, 1),
            "successful_recoveries": successful_recoveries,
            "failed_recoveries": failed_recoveries,
            "recovery_attempts": recovery_attempts,
            "needs_recovery": needs_recovery,

            "risk_distribution": risk_distribution,
            "total_risky_events": total_risky_events,

            "revenue_trend": revenue_trend,

            "recent_activity": recent_activity
        }

        return jsonify(
            make_json_serializable(result)
        )

    except Exception as e:
        print("DASHBOARD ERROR:", e)

        return jsonify({
            "error": str(e)
        }), 500

if __name__=='__main__':
    app.run(debug=True)