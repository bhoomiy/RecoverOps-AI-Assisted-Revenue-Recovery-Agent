import pandas as pd
import sqlite3

#get customer data
from config import DB_NAME
conn=sqlite3.connect(DB_NAME)
cursor=conn.cursor()
cursor.execute("select * from customer")
rows=cursor.fetchall()
df=pd.DataFrame(rows,columns=["customer_id",
                              "prev_purchases",
                              "total_spending",
                              "clv",
                              "customer_status"])

#get transaction data
cursor.execute("select * from transactions")
trows=cursor.fetchall()
t_df=pd.DataFrame(trows,columns=["transaction_id","amount","payment_status","customer_id","event_type","failure_reason","cart_value","items_count","timestamp"])

def analyze_customer(customer_id, transaction_id):
    result={}
    # first get the customers details
    customer=df[df["customer_id"]==customer_id]
    total_spending=customer.iloc[0]["total_spending"]
    clv=customer.iloc[0]["clv"]
    prev_purchases=customer.iloc[0]["prev_purchases"]

    #now get the transactions details
    cust_transaction=t_df[(t_df["customer_id"]==customer_id) & (t_df["transaction_id"]==transaction_id)]
    event_type=cust_transaction.iloc[0]["event_type"]
    amount=cust_transaction.iloc[0]["amount"]
    cart_value=cust_transaction.iloc[0]["cart_value"]
    timestamp=cust_transaction.iloc[0]["timestamp"]

    #Determine:NEW / RETURNING and Calculate:average_order_value
    if prev_purchases>0:
        avg_order_value=total_spending/prev_purchases
        cust_type= "Returning"
    else:
        avg_order_value=0
        cust_type= "New customer"

    #Determine:current_transaction_value
    if event_type =="PAYMENT_FAILED":
        current_transaction_value = amount
    elif event_type=="CHECKOUT_ABANDONED":
        current_transaction_value = cart_value
    elif event_type=="SUCCESSFUL_PURCHASE":
        current_transaction_value = amount

    # Determine:customer_value using CLV
    if clv < 9_000:
        customer_value="LOW"
    elif clv < 70_000:
        customer_value="MEDIUM"
    else:
        customer_value="HIGH"

    # store the results
    result["transaction_id"] = transaction_id
    result["customer_id"] = customer_id
    result["type"] = cust_type
    result["prev_purchases"] = prev_purchases
    result["total_spending"] = total_spending
    result["avg_order_value"] = avg_order_value
    result["clv"] = clv
    result["current_transaction_value"] = current_transaction_value
    result["customer_value"] = customer_value

    return result
    