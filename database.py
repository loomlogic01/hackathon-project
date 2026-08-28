import sqlite3

DB_config = "gembid.db"

def get_db_connection():
    conn = sqlite3.connect(DB_config, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS bid_evaluation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename VARCHAR(255) NOT NULL,
        tender_id VARCHAR(255) DEFAULT 'Not specified',
        years_of_experience INT DEFAULT 0,
        turnover_amount FLOAT DEFAULT 0,
        passed_checks TEXT DEFAULT '[]',
        failed_checks TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()
    
if __name__ == "__main__":
    init_db()