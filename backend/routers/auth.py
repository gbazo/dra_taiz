# app/backend/routers/auth.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

from ..config import settings
from ..utils.parse_client import parse_client

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    nome_completo: str
    tipo: str = "profissional"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        session_token: str = payload.get("session_token")
        if session_token is None:
            raise credentials_exception
        
        # Verify with Parse Server
        user = parse_client.get_current_user(session_token)
        return user
    except JWTError:
        raise credentials_exception
    except Exception:
        raise credentials_exception

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    try:
        # Authenticate with Parse Server
        user = parse_client.login(user_data.username, user_data.password)
        
        # Create JWT token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"session_token": user["sessionToken"], "username": user["username"]},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "objectId": user["objectId"],
                "username": user["username"],
                "email": user.get("email", ""),
                "nome_completo": user.get("nome_completo", ""),
                "tipo": user.get("tipo", "profissional")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid credentials")

@router.post("/register")
async def register(user_data: UserCreate):
    try:
        # Create user in Parse Server
        user = parse_client.create_user(
            username=user_data.username,
            password=user_data.password,
            email=user_data.email,
            nome_completo=user_data.nome_completo,
            tipo=user_data.tipo
        )
        
        return {"message": "User created successfully", "objectId": user["objectId"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user