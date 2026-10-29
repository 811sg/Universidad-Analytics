# Universidad Analytics 3.2

Dashboard local para análisis institucional de matrícula 2026-1.

## Ahora incluye
- Filtros cruzados en todas las vistas.
- Registro, edición y eliminación de estudiantes desde la aplicación.
- Copias de seguridad automáticas antes de modificar el dataset.
- Importación de CSV, JSON y XLSX con opción de agregar o reemplazar.
- Plantilla Excel oficial generada desde la aplicación.
- Exportación de Excel, CSV y JSON.
- Informe ejecutivo en Word (.docx).
- Vista ejecutiva independiente para imprimir o guardar como PDF.
- Reportes basados en la selección actual.
- Explorador de datos y gestión de registros.
- Sin sección de evolución mientras solo exista el periodo 2026-1.
- Exclusión de valores vacíos o categorías de dato no útil de las visualizaciones.

## Estructura del proyecto

```
universidad-analytics/
├── run.py                     # Punto de entrada del servidor
├── iniciar_dashboard.bat      # Lanzador para Windows (doble clic)
├── requirements.txt
├── backend/                   # API y lógica de negocio (Python)
│   ├── config.py              # Rutas, puerto, campos y etiquetas del modelo
│   ├── schema.py              # Normalización y validación de registros
│   ├── repository.py          # Lectura/escritura del dataset y backups
│   ├── analytics.py           # Resúmenes estadísticos
│   ├── importers.py           # Importación CSV / JSON / XLSX
│   ├── exporters/
│   │   ├── xlsx.py            # Exportación Excel y plantilla de carga
│   │   └── docx_report.py     # Informe ejecutivo en Word
│   └── app.py                 # Servidor HTTP: rutas /api/* y archivos estáticos
├── frontend/                  # Interfaz (HTML + CSS + JS), servida desde la raíz /
│   ├── index.html             # Resumen
│   ├── login.html
│   ├── pages/                 # Demografía, Académico, Geografía, Colegios, ...
│   └── assets/
│       ├── css/styles.css
│       └── js/
│           ├── core.js        # Estado, filtros, gráficas y utilidades compartidas
│           └── pages/         # Un script por vista
├── data/
│   ├── matriculados_limpios.json   # Dataset principal
│   ├── matriculados_limpios.csv    # Copia sincronizada automáticamente
│   ├── backups/                    # Copias automáticas (se crea sola)
│   └── metadata/                   # Diccionario de datos y reporte de calidad
└── docs/
    └── NOTAS_UX_DATOS.md
```

## Ejecución
En Windows ejecuta `iniciar_dashboard.bat`. En cualquier sistema:

```bash
pip install -r requirements.txt
python run.py
```

Luego entra por `http://localhost:8000`.

No abras los HTML con doble clic.

## Datos
El archivo principal es `data/matriculados_limpios.json`. Cada cambio realizado desde la aplicación actualiza también `data/matriculados_limpios.csv`.
Las copias anteriores se almacenan en `data/backups/`.

## Plantilla
Desde **Gestión de datos > Plantilla Excel** se genera un archivo con las mismas columnas del modelo. Incluye una hoja de instrucciones.


### 3.2 — endurecimiento visual y operativo
- Paleta institucional azul, azul claro y gris, sin verde en visualizaciones.
- Gráficas de barras y leyendas adaptativas para evitar solapamientos y desbordamientos.
- Se eliminó el filtrado implícito al hacer clic en las gráficas. Los filtros se aplican únicamente desde los controles visibles.
- Informe Word generado sin depender de `python-docx`.
- Importación de plantilla Excel con mapeo de encabezados amigables y validación de campos obligatorios.
- Centro de reportes compacto, sin espacios vacíos artificiales.

## Universidad 360 · versión profesional

La vista Universidad 360 incorpora una capa de exploración visual avanzada para el periodo disponible.

Incluye:
- ADN institucional con selección explícita de segmento.
- Flujos de matrícula con dimensiones configurables y tooltips.
- Constelación académica con filtro por facultad y nodos proporcionales a matrícula.
- Matriz institucional de intensidad entre dimensiones.
- Constructor de segmentos con hasta tres condiciones explícitas.
- Animaciones progresivas y respetuosas con `prefers-reduced-motion`.
- Diseño responsive con espacios reservados para etiquetas, leyendas y números.
- Lecturas metodológicas para evitar interpretar las relaciones como causalidad.

## Universidad 360 V5
La vista Universidad 360 fue rediseñada como una experiencia única de exploración espacial. La variable principal es matrícula. El usuario puede rotar la escena con el mouse, acercarse con la rueda, seleccionar una facultad y entrar a su nivel de programas. El tamaño de las esferas representa volumen de matrícula. No se usan gráficas independientes ni filtros ocultos en esta vista.
