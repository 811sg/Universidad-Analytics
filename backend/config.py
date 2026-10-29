"""Configuración central: rutas, servidor y modelo de datos."""
from pathlib import Path

# Rutas
ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT / "frontend"
DATA_DIR = ROOT / "data"
DATA = DATA_DIR / "matriculados_limpios.json"
BACKUP_DIR = DATA_DIR / "backups"

# Servidor
HOST, PORT = "0.0.0.0", 8000
VERSION = "3.2"
PERIOD = "2026-1"

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
