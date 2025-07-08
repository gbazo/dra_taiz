from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import os

from backend.routers import auth, clientes, fichas, agendamentos, procedimentos, pagamentos, homepage_settings

app = FastAPI(
    title="Clínica Estética API", 
    version="1.0.0",
    redirect_slashes=False  # Desabilita redirecionamento automático de barras
)

# Trusted Host Middleware (permite tanto HTTP quanto HTTPS)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Em produção, especifique os hosts permitidos
)

# Custom middleware to handle HTTPS redirect
@app.middleware("http")
async def force_https(request: Request, call_next):
    # Se estiver em produção e a requisição veio como HTTP, não redireciona, apenas processa
    response = await call_next(request)
    return response

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# API routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(clientes.router, prefix="/api/clientes", tags=["clientes"])
app.include_router(fichas.router, prefix="/api/fichas", tags=["fichas"])
app.include_router(agendamentos.router, prefix="/api/agendamentos", tags=["agendamentos"])
app.include_router(procedimentos.router, prefix="/api/procedimentos", tags=["procedimentos"])
app.include_router(pagamentos.router, prefix="/api/pagamentos", tags=["pagamentos"])
app.include_router(homepage_settings.router, prefix="/api/homepage_settings", tags=["homepage_settings"])

# Serve static files
app.mount("/css", StaticFiles(directory="frontend/css"), name="css")
app.mount("/js", StaticFiles(directory="frontend/js"), name="js")
app.mount("/img", StaticFiles(directory="frontend/img"), name="img")

# Serve HTML pages
@app.get("/")
async def read_index():
    return FileResponse("frontend/index.html")

@app.get("/homepage")
async def read_homepage():
    return FileResponse("frontend/homepage.html")

@app.get("/login")
async def read_login():
    return FileResponse("frontend/login.html")

@app.get("/register")
async def read_register():
    return FileResponse("frontend/register.html")

@app.get("/dashboard")
async def read_dashboard():
    return FileResponse("frontend/dashboard.html")

@app.get("/clientes")
async def read_clientes():
    return FileResponse("frontend/clientes.html")

@app.get("/ficha/{cliente_id}")
async def read_ficha(cliente_id: str):
    return FileResponse("frontend/ficha_anamnese.html")

@app.get("/agenda")
async def read_agenda():
    return FileResponse("frontend/agenda.html")

@app.get("/procedimentos")
async def read_procedimentos():
    return FileResponse("frontend/procedimentos.html")

@app.get("/links")
async def read_links():
    return FileResponse("frontend/links.html")

@app.get("/pagamento")
async def read_pagamento():
    return FileResponse("frontend/pagamento.html")

@app.get("/homepage_config")
async def read_homepage_config():
    return FileResponse("frontend/homepage_config.html")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}