"""
FinGuard AI - Unified Platform Launcher
=======================================
File: run_platform.py

Launches the FastAPI backend and serves the compiled React intelligence dashboard.
Runs on http://localhost:8000
"""

import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def verify_database():
    """Verify SQLite database exists and is populated."""
    db_path = os.path.join(PROJECT_ROOT, "database", "fraud_detection.db")
    if not os.path.exists(db_path):
        print("  -> Database not found. Seeding initial transactions...")
        from backend.app.database.seed import seed_database
        seed_database()
    else:
        print(f"  -> Database verified at {db_path}")


def main():
    print("=" * 68)
    print("  FinGuard AI | Credit Card Fraud Detection & Intelligence Platform")
    print("=" * 68)

    print("\n[1/3] Verifying database records...")
    verify_database()

    print("[2/3] Preloading ML Champion Model & API routes...")
    from backend.app.main import app
    import uvicorn

    print("[3/3] Server initialized successfully!")
    print("\n" + "=" * 68)
    print("  >> FinGuard Web Dashboard : http://localhost:8000")
    print("  >> Interactive API Docs   : http://localhost:8000/docs")
    print("  >> API Health Status      : http://localhost:8000/api/health")
    print("=" * 68 + "\n")
    print("Server is active and listening for requests.")
    print("Keep this terminal window open. (Press Ctrl+C to stop)\n")

    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")


if __name__ == "__main__":
    main()
