"""Configuración central: rutas, servidor y modelo de datos."""
import os
from pathlib import Path

# Rutas
ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT / "frontend"
SEED_DIR = ROOT / "data"  # datos incluidos en el proyecto (semilla inicial)
# En producción se puede apuntar a un disco persistente con DATA_DIR=/ruta/al/disco
DATA_DIR = Path(os.environ.get("DATA_DIR", SEED_DIR))
DATA = DATA_DIR / "matriculados_limpios.json"
BACKUP_DIR = DATA_DIR / "backups"

# Servidor
HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", 8000))  # los hosting en la nube definen PORT
VERSION = "3.2"
PERIOD = "2026-1"

# Protección opcional con usuario y contraseña (HTTP Basic). Si no se definen, queda abierto (uso local).
AUTH_USER = os.environ.get("APP_USER", "")
AUTH_PASSWORD = os.environ.get("APP_PASSWORD", "")

# Modelo de datos
FIELDS = [
    "Ano", "Barrio", "Comuna", "Ciudad Nacimiento", "Pais Nacimiento", "Id Estrato",
    "Nombre Programa", "Sexo", "Tipo Inscripcion", "Sede", "Facultad", "Area Conocimiento",
    "Institucion", "Colegio", "Modalidad", "Tipo Programa", "Estrato"
]
LABELS = {
    "Ano":"Año", "Barrio":"Barrio", "Comuna":"Comuna", "Ciudad Nacimiento":"Ciudad de nacimiento",
    "Pais Nacimiento":"País de nacimiento", "Id Estrato":"Estrato (código)", "Nombre Programa":"Programa",
    "Sexo":"Sexo", "Tipo Inscripcion":"Tipo de inscripción", "Sede":"Sede", "Facultad":"Facultad",
    "Area Conocimiento":"Área de conocimiento", "Institucion":"Institución educativa", "Colegio":"Tipo de colegio",
    "Modalidad":"Modalidad", "Tipo Programa":"Nivel del programa", "Estrato":"Estrato"
}
INVALID = {"", "no registrado", "sin dato", "no registra", "desconocido", "desconocida", "nan", "null", "undefined", "** seleccionar**", "** desconocido **", "** desconocida **"}
REQUIRED_IMPORT_FIELDS = {"Ano", "Nombre Programa", "Sede", "Facultad", "Modalidad", "Tipo Programa"}
