# Frogger Complete

Juego web estilo Frogger construido con **Django 5**, **JavaScript Canvas** y configuración lista para desplegar en **Render**.

## Mejoras incluidas
- Proyecto Django funcional con rutas, plantillas, estáticos y endpoint `/health/`.
- Arcade completo: autos, río, troncos, niveles, puntaje, vidas y dificultad.
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
