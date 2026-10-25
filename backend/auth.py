import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import HTTPException, status
from jwt import InvalidTokenError
from pwdlib import PasswordHash

load_dotenv()

password_hash = PasswordHash.recommended()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY is missing from .env")


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return password_hash.verify(plain_password, hashed_password)
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    return jwt.encode(
        {"sub": str(user_id), "exp": expires_at},
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


def decode_access_token(token: str) -> int:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("sub")

        if not isinstance(user_id, str):
            raise credentials_error

        return int(user_id)

    except (InvalidTokenError, ValueError):
        raise credentials_error

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from psycopg import OperationalError
from psycopg.rows import dict_row

from db import get_connection

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    user_id = decode_access_token(token)

    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    """
                    SELECT user_id, user_name, role
                    FROM public.app_user
                    WHERE user_id = %s
                    """,
                    (user_id,)
                )
                user = cur.fetchone()

    except OperationalError:
        raise HTTPException(
            status_code=503,
            detail="Database is currently unavailable"
        )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User no longer exists",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user


def require_admin(user: dict = Depends(get_current_user)):
    if user["role"] != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user

def require_booking_access(
    user: dict = Depends(get_current_user)
):
    if user["role"] not in ("Admin", "Operator"):
        raise HTTPException(
            status_code=403,
            detail="Admin or Operator access required"
        )

    return user
