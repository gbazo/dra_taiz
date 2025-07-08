from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class MetodoPagamento(str, Enum):
    dinheiro = "dinheiro"
    pix = "pix"
    credito = "credito"
    debito = "debito"

class StatusPagamento(str, Enum):
    pago = "pago"
    pendente = "pendente"

class PagamentoBase(BaseModel):
    agendamento_id: str
    valor_procedimento: float
    desconto: Optional[float] = 0.0
    acrescimo: Optional[float] = 0.0
    valor_final: float
    metodo_pagamento: MetodoPagamento
    status: StatusPagamento = StatusPagamento.pendente
    data_pagamento: Optional[datetime] = None
    transacao_id: Optional[str] = None

class PagamentoCreate(PagamentoBase):
    pass

class Pagamento(PagamentoBase):
    objectId: str
    createdAt: str
    updatedAt: str
