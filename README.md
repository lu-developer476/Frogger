# Frogger Complete

Juego web estilo Frogger construido con **Django 5**, **JavaScript Canvas** y configuración lista para desplegar en **Render**.

## Mejoras incluidas
- Proyecto Django funcional con rutas, plantillas, estáticos y endpoint `/health/`.
- Arcade ampliado: autos, río, troncos, cinco metas, temporizador, rachas, bonus, escudos, niveles, puntaje, vidas y dificultad.
- Controles con flechas/WASD, Enter y gestos táctiles.
- UI responsive con HUD y mejor puntaje en `localStorage`.
- Configuración de producción con Gunicorn, WhiteNoise y variables para Render.

## Desarrollo local
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Render
`render.yaml` instala dependencias, ejecuta `collectstatic`, arranca `gunicorn frogger.wsgi:application` y usa `/health/` como health check.

Variables generadas para Render:

| Variable | Valor sugerido | Propósito |
| --- | --- | --- |
| `DEBUG` | `False` | Ejecuta Django en modo producción. |
| `SECRET_KEY` | `generateValue` en Render | Firma criptográfica segura. |
| `ALLOWED_HOSTS` | `.onrender.com,tu-servicio.onrender.com` | Hosts permitidos por Django. |
| `CSRF_TRUSTED_ORIGINS` | `https://*.onrender.com,https://tu-servicio.onrender.com` | Orígenes confiables para formularios/CSRF. |
| `SECURE_SSL_REDIRECT` | `True` | Fuerza HTTPS en producción. |
| `SECURE_HSTS_SECONDS` | `31536000` | HSTS por un año. |
| `PYTHON_VERSION` | `3.12.4` | Fija runtime Python en Render. |
| `WEB_CONCURRENCY` | `2` | Workers sugeridos para Gunicorn. |

También podés copiar `.env.render.example` si configurás variables manualmente desde el panel de Render.
