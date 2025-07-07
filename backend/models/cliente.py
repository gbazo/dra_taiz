from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class ClienteBase(BaseModel):
    nome_completo: str
    data_nascimento: date
    telefone: str
    email: Optional[EmailStr] = None
    endereco: Optional[str] = None
    cpf: Optional[str] = None
    rg: Optional[str] = None
    profissao: Optional[str] = None
    indicacao: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(ClienteBase):
    nome_completo: Optional[str] = None
    data_nascimento: Optional[date] = None
    telefone: Optional[str] = None

class Cliente(ClienteBase):
    objectId: str
    createdAt: str
    updatedAt: str
    criado_por: str

    class Config:
        orm_mode = True