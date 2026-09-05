import pandas as pd 
import sqlite3

from config import DB_NAME
conn=sqlite3.connect(DB_NAME)
cursor=conn.cursor()

#fetch from database
cursor.execute("select * from transactions;")
rows=cursor.fetchall()

df=pd.DataFrame(rows,columns=["transaction_id","amount","payment_status","customer_id","event_type","failure_reason","cart_value","items_count","timestamp"])

#cause analysis
def analyze_payment_cause(failure_reason):
    if failure_reason=="BANK_DECLINED":
        cause_category="BANK_RESTRICTION"
        recoverability="LOW"
    elif failure_reason=="AUTHENTICATION_FAILED":
        cause_category="CUSTOMER_ACTION_REQUIRED"
        recoverability="MEDIUM"
    elif failure_reason=="INSUFFICIENT_FUNDS":
        cause_category="CUSTOMER_FINANCIAL"
        recoverability="LOW"
    elif failure_reason=="EXPIRED_CARD":
        cause_category="CUSTOMER_ACTION_REQUIRED"
        recoverability="MEDIUM"
    elif failure_reason=="NETWORK_ERROR":
        cause_category="TEMPORARY"
        recoverability="HIGH"
    else:
        cause_category = "UNKNOWN"
        recoverability = "UNKNOWN"

    return cause_category,recoverability


#analyze chekout abondment
def analyze_checkout(cart_value, items_count):
    # Cart value category
    if cart_value < 5000:
        value_category = "LOW_VALUE"
    elif cart_value < 15000:
        value_category = "MEDIUM_VALUE"
    else:
        value_category = "HIGH_VALUE"

    # Cart size category
    if items_count <= 2:
        cart_size = "SMALL_CART"
    elif items_count <= 5:
        cart_size = "MEDIUM_CART"
    else:
        cart_size = "LARGE_CART"

    # Recovery potential
    if value_category == "HIGH_VALUE":
        recovery_potential = "HIGH"
    elif value_category == "MEDIUM_VALUE":
        recovery_potential = "MEDIUM"
    else:
        recovery_potential = "LOW"

    return value_category, cart_size, recovery_potential


def risk_level_detector(amount_at_risk):
    if amount_at_risk<5000:
                risk_level="LOW"
    elif amount_at_risk >=5000 and amount_at_risk<15000:
                risk_level="MEDIUM"
    else:
                risk_level="HIGH"
    return risk_level


def detect_revenue_risk(transaction_id):
        event= df[df["transaction_id"] == transaction_id]

        if event.empty:
            return None

        event = event.iloc[0]
        result={}
        if event["event_type"]=="PAYMENT_FAILED":
            risk=True
            risk_type="PAYMENT_FAILURE"
            amount_at_risk=event["amount"]
            risk_level=risk_level_detector(amount_at_risk)
            cause=event["failure_reason"]
            cause_category, recoverability=analyze_payment_cause(event["failure_reason"])
            value_category = None
            cart_size = None
            recovery_potential = None

        elif event["event_type"]=="CHECKOUT_ABANDONED":
            risk=True
            risk_type="CHECKOUT_ABANDONMENT"
            amount_at_risk=event["cart_value"]
            risk_level=risk_level_detector(amount_at_risk)
            cause = None
            cause_category = None
            recoverability = None
            value_category, cart_size, recovery_potential = analyze_checkout(event["cart_value"],event["items_count"])

        else:
            risk=False
            risk_type = None
            amount_at_risk = 0
            risk_level = None
            cause=None
            cause_category=None
            recoverability=None
            value_category = None
            cart_size = None
            recovery_potential = None

        result["transaction_id"] = event["transaction_id"]
        result["risk"]=risk
        result["risk_type"]=risk_type
        result["amount_at_risk"]=amount_at_risk
        result["risk_level"]=risk_level
        result["cause"]=cause
        result["cause_category"]=cause_category
        result["recoverability"]=recoverability
        result["value_category"] = value_category
        result["cart_size"] = cart_size
        result["recovery_potential"] = recovery_potential

        return result