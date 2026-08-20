import sqlite3
import random
from datetime import datetime, timedelta

DB_NAME = r"C:\Users\RADHAGOPINATH\recovery_revenue.db"

conn = sqlite3.connect(DB_NAME)
cursor = conn.cursor()

# GENERATE CUSTOMERS
NO_OF_CUSTOMERS = 800

for _ in range(NO_OF_CUSTOMERS):

    prev_purchases = random.choices(
        range(0, 31),
        weights=[
            20, 18, 16, 14, 12,
            10, 9, 8, 7, 6,
            5, 5, 4, 4, 3,
            3, 2, 2, 2, 2,
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1
        ],
        k=1
    )[0]

    cust_status = prev_purchases > 0

    if prev_purchases == 0:
        total_spending = 0.0
    else:
        average_order_value = random.uniform(500, 10000)

        total_spending = round(
            prev_purchases * average_order_value,
            2
        )

    if total_spending == 0:
        clv = round(random.uniform(200, 1000), 2)
    else:
        future_value = random.uniform(1.1, 1.8)
        clv = round(
            total_spending * future_value,
            2
        )

    cursor.execute(
        '''
        INSERT INTO customer
        (prev_purchases, total_spending, clv, cust_status)
        VALUES (?, ?, ?, ?)
        ''',
        (
            prev_purchases,
            total_spending,
            clv,
            cust_status
        )
    )

# GENERATE TRANSACTIONS
NO_OF_TRANSACTIONS = 4000

event_types = [
    "SUCCESSFUL_PURCHASE",
    "PAYMENT_FAILED",
    "CHECKOUT_ABANDONED"
]

event_weights = [65, 20, 15]

payment_methods = [
    "CARD",
    "UPI",
    "WALLET",
    "NET_BANKING"
]

failure_reasons = [
    "NETWORK_ERROR",
    "INSUFFICIENT_FUNDS",
    "EXPIRED_CARD",
    "BANK_DECLINED",
    "AUTHENTICATION_FAILED"
]

# Get existing customer IDs
cursor.execute("SELECT cust_id FROM customer")
customer_ids = [row[0] for row in cursor.fetchall()]

# Generate timestamps across the previous 90 days
end_date = datetime.now()
start_date = end_date - timedelta(days=90)

for _ in range(NO_OF_TRANSACTIONS):
    customer_id = random.choice(customer_ids)
    event_type = random.choices(
        event_types,
        weights=event_weights,
        k=1
    )[0]
    cart_value = round(
        random.uniform(500, 20000),
        2
    )

    no_of_items = random.randint(1, 8)
    payment_method = random.choice(payment_methods)
    random_seconds = random.randint(
        0,
        int((end_date - start_date).total_seconds())
    )
    timestamp = start_date + timedelta(
        seconds=random_seconds
    )
    timestamp = timestamp.strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    # SUCCESSFUL PURCHASE
    if event_type == "SUCCESSFUL_PURCHASE":
        amount = cart_value
        payment_status = "SUCCESS"
        failure_reason = None

    # PAYMENT FAILURE
    elif event_type == "PAYMENT_FAILED":
        amount = cart_value
        payment_status = "FAILED"
        failure_reason = random.choice(
            failure_reasons
        )

    # CHECKOUT ABANDONMENT
    else:
        amount = 0.0
        payment_status = "NOT_COMPLETED"
        failure_reason = None

    cursor.execute(
        '''
        INSERT INTO transactions
        (
            amount,
            payment_status,
            customer_id,
            event_type,
            failure_reason,
            cart_value,
            no_of_items,
            timestamp
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        (
            amount,
            payment_status,
            customer_id,
            event_type,
            failure_reason,
            cart_value,
            no_of_items,
            timestamp
        )
    )


conn.commit()
conn.close()

print("Data generation completed successfully.")
print(f"{NO_OF_CUSTOMERS} customers generated.")
print(f"{NO_OF_TRANSACTIONS} transactions generated.")