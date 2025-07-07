from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class ClienteBase(BaseModel):
    nome_completo: str
    telefone: str
    email: EmailStr
    data_nascimento: date
    observacoes: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nome_completo: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    data_nascimento: Optional[date] = None
    observacoes: Optional[str] = None

class Cliente(ClienteBase):
    objectId: str
    createdAt: str
    updatedAt: str