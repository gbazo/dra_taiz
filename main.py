from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from backend.routers import auth, clientes, fichas, agendamentos, procedimentos

app = FastAPI(title="Clínica Estética API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(clientes.router, prefix="/api/clientes", tags=["clientes"])
app.include_router(fichas.router, prefix="/api/fichas", tags=["fichas"])
app.include_router(agendamentos.router, prefix="/api/agendamentos", tags=["agendamentos"])
app.include_router(procedimentos.router, prefix="/api/procedimentos", tags=["procedimentos"])

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

@app.get("/links")
async def read_links():
    return FileResponse("frontend/links.html")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
