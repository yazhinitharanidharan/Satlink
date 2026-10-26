"""Create or update a SATLINK administrator account.

Run this after applying satlink_schema.sql and satlink_ui_integration.sql:

    python create_admin.py --username admin --email admin@satlink.local
"""

import argparse
import getpass
import sys
from pathlib import Path

from dotenv import load_dotenv
from psycopg.rows import dict_row
from pwdlib import PasswordHash

from db import get_connection

load_dotenv(Path(__file__).with_name(".env"))

password_hash = PasswordHash.recommended()


def prompt_password() -> str:
    password = getpass.getpass("Password: ")
    confirmation = getpass.getpass("Confirm password: ")

    if password != confirmation:
        raise SystemExit("Passwords do not match.")

    if len(password) < 8:
        raise SystemExit("Password must be at least 8 characters.")

    return password


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create or update a SATLINK administrator account."
    )
    parser.add_argument("--username", default="admin")
    parser.add_argument("--email", default="admin@satlink.local")
    parser.add_argument("--full-name", default="System Administrator")
    args = parser.parse_args()

    password = prompt_password()
    hashed_password = password_hash.hash(password)

    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    "SELECT user_id FROM public.app_user WHERE user_name = %s",
                    (args.username,),
                )
                existing = cur.fetchone()

                if existing:
                    cur.execute(
                        """
                        UPDATE public.app_user
                        SET role = 'Admin',
                            email = %s,
                            password = %s,
                            full_name = %s,
                            status = 'active'
                        WHERE user_id = %s
                        """,
                        (
                            args.email,
                            hashed_password,
                            args.full_name,
                            existing["user_id"],
                        ),
                    )
                    action = "updated"
                else:
                    cur.execute(
                        """
                        INSERT INTO public.app_user
                            (user_name, role, email, password, full_name, status)
                        VALUES (%s, 'Admin', %s, %s, %s, 'active')
                        """,
                        (
                            args.username,
                            args.email,
                            hashed_password,
                            args.full_name,
                        ),
                    )
                    action = "created"

        print(f"Administrator '{args.username}' {action} successfully.")

    except Exception as error:
        print(f"Unable to create administrator: {error}", file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
