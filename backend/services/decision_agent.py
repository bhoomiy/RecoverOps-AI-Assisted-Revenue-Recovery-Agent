from services.risk_detector import detect_revenue_risk
from services.customer_analyzer import analyze_customer
import sqlite3


#get transaction details
DB_NAME=r"C:\Users\RADHAGOPINATH\recovery_revenue.db"


def get_decision(transaction_id, customer_id):
    # Call Risk Detector
    risk_result = detect_revenue_risk(transaction_id)

    # Call Customer Analyzer
    customer_result = analyze_customer(customer_id, transaction_id)

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM transactions WHERE transac_id = ?",(transaction_id,))

    row = cursor.fetchone()
    transaction_details = dict(row)

    conn.close()

    decision = decide_recovery_action(
        risk_result,
        customer_result,
        transaction_details
    )

    return decision

#for customer value
def decide_priority(risk_result, customer_result):
    risk_level = risk_result["risk_level"]
    recoverability = risk_result["recoverability"]
    customer_value = customer_result["customer_value"]

    if risk_level == "HIGH" and customer_value == "HIGH":
        priority = "HIGH"

    elif recoverability == "HIGH":
        priority = "HIGH"

    elif risk_level == "MEDIUM" or customer_value == "MEDIUM":
        priority = "MEDIUM"

    else:
        priority = "LOW"

    return priority

def decide_recovery_action(risk_result, customer_result,transaction_details):
    decision = {}

    #extract details
    transaction_id=transaction_details["transac_id"]
    event_type = transaction_details["event_type"]
    failure_reason = transaction_details["failure_reason"]
    customer_value = customer_result["customer_value"]
    risk_level = risk_result["risk_level"]
    recoverability = risk_result["recoverability"]

    # inspect event type
    if event_type == "PAYMENT_FAILED":
        print(f"PAYMENT FAILED DUE TO {failure_reason}")

        if failure_reason == "EXPIRED_CARD":
            action = "REQUEST_PAYMENT_METHOD_UPDATE"
            reason = "Card has expired and customer needs to update payment method"

        elif failure_reason == "NETWORK_ERROR":
            action = "RETRY_PAYMENT"
            reason = "Payment failed due to a temporary network error"

        elif failure_reason == "AUTHENTICATION_FAILED":
            action = "REQUEST_AUTHENTICATION"
            reason = "Customer authentication is required to complete payment"

        elif failure_reason == "INSUFFICIENT_FUNDS":
            action = "RETRY_LATER"
            reason = "Payment failed due to insufficient funds"

        elif failure_reason == "BANK_DECLINED":
            action = "SUGGEST_ALTERNATIVE_PAYMENT"
            reason = "Bank declined the payment, so an alternative payment method is recommended"


        else:
            action="NO_ACTION"
            reason="Payment failure reason is unknown"
        
    elif event_type == "CHECKOUT_ABANDONED":
        value_category = risk_result["value_category"]
        recovery_potential = risk_result["recovery_potential"]

        if customer_value == "HIGH":
            action = "SEND_CHECKOUT_REMINDER"
            reason = "High-value customer abandoned the checkout"

        elif customer_value == "MEDIUM" and recovery_potential in ["HIGH", "MEDIUM"]:
            action = "SEND_CHECKOUT_REMINDER"
            reason = "Customer has sufficient value and the checkout has good recovery potential"

        elif customer_value == "LOW" and value_category == "HIGH_VALUE":
            action = "SEND_CHECKOUT_REMINDER"
            reason = "High-value cart makes the abandoned checkout worth recovering"

        else:
            action = "NO_ACTION"
            reason = "Checkout has low recovery value"

    elif event_type == "SUCCESSFUL_PURCHASE":
        action = "NO_ACTION"
        reason = "Transaction was successful, so no recovery action is required"

    else:
        action="NO_ACTION"
        reason="No action required"

    decision["t_id"]=transaction_id
    if event_type == "CHECKOUT_ABANDONED":
        decision["amount"] = transaction_details["cart_value"]
    else:
        decision["amount"] = transaction_details["amount"]
    decision["action"] = action
    priority = decide_priority(risk_result, customer_result)
    decision["priority"]=priority
    decision["reason"]=reason
    decision["recoverability"]=recoverability
    decision["customer_value"]=customer_value
    decision["customer_type"]=customer_result["type"]

    return decision



# decision = get_decision(3658, 3)
# print(decision)