# Notas UX, datos y evolución

## Problema de localhost resuelto

La versión anterior dependía de `fetch('data/matriculados_limpios.json')`. Cuando se abría una página con doble clic (`file://`) el navegador podía bloquear la lectura del JSON. La nueva versión usa `backend/` (`python run.py`) y consulta `/api/data`.

## UX

- Navegación lateral compacta con iconos.
- Filtros primarios siempre visibles.
- Filtros secundarios en panel lateral para no consumir pantalla.
- Chips para mostrar el contexto activo.
- Indicadores recalculados en cada filtro.
- Gráficos SVG sin dependencia externa.
- Interacciones por clic sobre barras y segmentos.
- Exportación de la selección actual.
- Importación de periodos futuros.

## Gráficas y contexto

No se usa una gráfica de línea de tiempo con un único semestre. Eso sugeriría una evolución inexistente. En su lugar se usan gráficos de composición, concentración y cruces que sí responden a las variables disponibles.

## Futuro

Cuando existan varios periodos, se pueden agregar:
- evolución de matrícula,
- variación por programa,
- participación por modalidad,
- retención interperiodo,
- cambios de sede,
- capacidad y ocupación,
- alertas de concentración,
- comparación entre periodos,
- escenarios de planeación.

Para retención se necesitaría un identificador institucional anonimizado y consistente entre periodos.
