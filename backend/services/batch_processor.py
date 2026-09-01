import sqlite3

from services.risk_detector import detect_revenue_risk
from services.customer_analyzer import analyze_customer
from services.decision_agent import get_decision
from services.recovery_simulator import recovery_simulator


DB_NAME = r"C:\Users\RADHAGOPINATH\recovery_revenue.db"


def process_batch(limit=100):

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM transactions
        ORDER BY transac_id
        LIMIT ?
    """, (limit,))

    transactions = cursor.fetchall()
    conn.close()

    results = []

    for transaction in transactions:

        transaction_id = transaction["transac_id"]
        customer_id = transaction["customer_id"]
        event_type = transaction["event_type"]

        # Skip successful transactions
        if event_type == "SUCCESSFUL_PURCHASE":
            continue

        try:
            risk_result = detect_revenue_risk(transaction_id)

            if not risk_result["risk"]:
                continue

            customer_result = analyze_customer(
                customer_id,
                transaction_id
            )

            decision_result = get_decision(
                transaction_id,
                customer_id
            )

            recovery_result = recovery_simulator(
                transaction_id,
                decision_result["action"],
                decision_result["amount"],
                decision_result["recoverability"],
                decision_result["customer_value"],
                decision_result["customer_type"]
            )

            results.append({
                "transaction_id": transaction_id,
                "customer_id": customer_id,
                "event_type": event_type,
                "action": decision_result["action"],
                "success": recovery_result["success"],
                "revenue_recovered": recovery_result["revenue_recovered"],
                "revenue_lost": recovery_result["revenue_lost"]
            })

        except Exception as e:
            print(
                f"Error processing transaction {transaction_id}: {e}"
            )

    return results


if __name__ == "__main__":

    batch_results = process_batch(100)

    print("\nBATCH COMPLETE")
    print("-----------------------")

    print("Recovery attempts:", len(batch_results))

    
    risky_processed = len(batch_results)

    actual_attempts = sum(
        1 for result in batch_results
        if result["action"] != "NO_ACTION"
    )

    no_action_count = sum(
        1 for result in batch_results
        if result["action"] == "NO_ACTION"
    )

    successful = sum(
        1 for result in batch_results
        if result["success"]
    )

    total_recovered = sum(
        result["revenue_recovered"]
        for result in batch_results
    )

    print("\nBATCH COMPLETE")
    print("-----------------------")
    print("Risky transactions processed:", risky_processed)
    print("Actual recovery attempts:", actual_attempts)
    print("No-action decisions:", no_action_count)
    print("Successful recoveries:", successful)
    print("Revenue recovered:", total_recovered)
    

