from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from psycopg import OperationalError
from psycopg.rows import dict_row

from db import get_connection
from auth import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        with get_connection() as conn:
            with conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    """
                    SELECT user_id, user_name, role, password
                    FROM public.app_user
                    WHERE user_name = %s
                    """,
                    (form_data.username,)
                )
                user = cur.fetchone()

        if not user or not verify_password(
            form_data.password,
            user["password"]
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"}
            )

        access_token = create_access_token(user["user_id"])

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user["role"],
            "user_id": user["user_id"]
        }

    except OperationalError:
        raise HTTPException(
            status_code=503,
            detail="Database is currently unavailable"
        )
