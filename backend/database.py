from pathlib import Path
import sqlite3
import pandas as pd


# ==========================================
# PROJECT PATHS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

CSV_PATH = (
    BASE_DIR
    / "data"
    / "cleaned"
    / "tech_advertising_campaigns_cleaned.csv"
)

DB_PATH = BASE_DIR / "backend" / "marketing.db"


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_connection():
    """Create a connection to the SQLite database."""
    return sqlite3.connect(DB_PATH)


# ==========================================
# INITIALIZE DATABASE
# ==========================================

def init_db():

    # Check that CSV exists
    if not CSV_PATH.exists():
        raise FileNotFoundError(
            f"Cleaned dataset not found at:\n{CSV_PATH}"
        )

    # Read the CSV
    df = pd.read_csv(CSV_PATH)

    # Create database
    with get_connection() as conn:

        # Check whether campaigns table already exists
        table_exists = conn.execute(
            """
            SELECT name
            FROM sqlite_master
            WHERE type='table'
            AND name='campaigns'
            """
        ).fetchone()

        # Create table if it doesn't exist
        if table_exists is None:

            print("Creating campaigns table...")

            df.to_sql(
                "campaigns",
                conn,
                if_exists="replace",
                index=False
            )

            print("Database created successfully!")
            print(f"Records loaded: {len(df)}")

        else:

            # Check how many records exist
            count = conn.execute(
                "SELECT COUNT(*) FROM campaigns"
            ).fetchone()[0]

            print("Database already exists.")
            print(f"Records in database: {count}")


# ==========================================
# RUN DIRECTLY
# ==========================================

if __name__ == "__main__":
    init_db()