import sqlite3
from datetime import datetime

DB_NAME = r"C:\Users\RADHAGOPINATH\recovery_revenue.db"


def create_recovery_table():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()


    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recovery_tracking (
            recovery_id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id INTEGER UNIQUE,
            action_taken TEXT,
            success INTEGER,
            original_revenue_at_risk REAL,
            revenue_recovered REAL,
            revenue_lost REAL,
            simulation_result TEXT,
            reason TEXT,
            timestamp TEXT
        )
    """)

    conn.commit()
    conn.close()



def track_recovery(simulation_result):

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
        simulation_result["transaction_id"],
        simulation_result["action_taken"],
        int(simulation_result["success"]),
        simulation_result["original_revenue_at_risk"],
        simulation_result["revenue_recovered"],
        simulation_result["revenue_lost"],
        simulation_result["simulation_result"],
        simulation_result["reason"],
        datetime.now().isoformat()
    ))

    inserted = cursor.rowcount > 0

    conn.commit()
    conn.close()

    return inserted

if __name__ == "__main__":
    create_recovery_table()
    print("Recovery tracking table created successfully.")