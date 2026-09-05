import sqlite3
from datetime import datetime

from services.risk_detector import detect_revenue_risk
from services.customer_analyzer import analyze_customer
from services.decision_agent import get_decision
from services.recovery_simulator import recovery_simulator


from config import DB_NAME


def process_batch(limit=30):

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Only fetch risky transactions that do not
    # already have a recovery tracking record.
    cursor.execute("""
        SELECT t.*
        FROM transactions t

        LEFT JOIN recovery_tracking r
            ON t.transac_id = r.transaction_id

        WHERE
            t.event_type IN (
                'PAYMENT_FAILED',
                'CHECKOUT_ABANDONED'
            )

            AND r.transaction_id IS NULL

        ORDER BY t.transac_id

        LIMIT ?
    """, (limit,))

    transactions = cursor.fetchall()

    conn.close()

    results = []


    for transaction in transactions:

        transaction_id = transaction["transac_id"]
        customer_id = transaction["customer_id"]
        event_type = transaction["event_type"]

        try:

            # ---------------------------------
            # Risk detector
            # ---------------------------------

            risk_result = detect_revenue_risk(
                transaction_id
            )

            if not risk_result["risk"]:
                continue


            # ---------------------------------
            # Customer analyzer
            # ---------------------------------

            customer_result = analyze_customer(
                customer_id,
                transaction_id
            )


            # ---------------------------------
            # Decision agent
            # ---------------------------------

            decision_result = get_decision(
                transaction_id,
                customer_id
            )


            action = decision_result["action"]


            # Do not simulate NO_ACTION decisions.
            if action == "NO_ACTION":

                results.append({
                    "transaction_id": transaction_id,
                    "customer_id": customer_id,
                    "event_type": event_type,
                    "action": action,
                    "success": False,
                    "skipped": True,
                    "revenue_recovered": 0,
                    "revenue_lost": 0
                })

                continue


            # ---------------------------------
            # Recovery simulator
            # ---------------------------------

            recovery_result = recovery_simulator(
                transaction_id,
                action,
                decision_result["amount"],
                decision_result["recoverability"],
                decision_result["customer_value"],
                decision_result["customer_type"]
            )


            # ---------------------------------
            # Persist recovery result
            # ---------------------------------

            conn = sqlite3.connect(DB_NAME)
            cursor = conn.cursor()

            cursor.execute("""
                INSERT OR IGNORE INTO recovery_tracking (
                    transaction_id,
                    action_taken,
                    success,
                    original_revenue_at_risk,
                    revenue_recovered,
                    revenue_lost,
                    simulation_result,
                    reason,
                    timestamp
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                transaction_id,
                recovery_result["action_taken"],
                int(recovery_result["success"]),
                recovery_result["original_revenue_at_risk"],
                recovery_result["revenue_recovered"],
                recovery_result["revenue_lost"],
                recovery_result["simulation_result"],
                recovery_result["reason"],
                datetime.now().isoformat()
            ))

            conn.commit()
            conn.close()


            results.append({
                "transaction_id": transaction_id,
                "customer_id": customer_id,
                "event_type": event_type,
                "action": action,
                "success": recovery_result["success"],
                "skipped": False,
                "revenue_recovered":
                    recovery_result["revenue_recovered"],
                "revenue_lost":
                    recovery_result["revenue_lost"]
            })


        except Exception as e:

            print(
                f"Error processing transaction "
                f"{transaction_id}: {e}"
            )


    return results


if __name__ == "__main__":

    batch_results = process_batch(30)

    attempted = [
        result
        for result in batch_results
        if not result.get("skipped")
    ]

    no_action = [
        result
        for result in batch_results
        if result.get("skipped")
    ]

    successful = sum(
        1
        for result in attempted
        if result["success"]
    )

    failed = sum(
        1
        for result in attempted
        if not result["success"]
    )

    total_recovered = sum(
        result["revenue_recovered"]
        for result in attempted
    )


    print("\nBATCH COMPLETE")
    print("-----------------------")

    print(
        "Transactions evaluated:",
        len(batch_results)
    )

    print(
        "Recovery attempts:",
        len(attempted)
    )

    print(
        "No-action decisions:",
        len(no_action)
    )

    print(
        "Successful recoveries:",
        successful
    )

    print(
        "Failed recoveries:",
        failed
    )

    print(
        "Revenue recovered:",
        total_recovered
    )