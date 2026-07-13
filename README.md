# Frogger Complete

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.x-092E20?logo=django&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Canvas-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-Templates-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Responsive-1572B6?logo=css3&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-22.x-499848?logo=gunicorn&logoColor=white)
![WhiteNoise](https://img.shields.io/badge/WhiteNoise-staticfiles-5B5B5B)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=black)

Juego web estilo Frogger construido con **Django 5**, **JavaScript Canvas** y configuración lista para desplegar en **Render**.

## Estado actual

El proyecto está en una versión funcional y desplegable. Incluye una aplicación Django mínima que sirve el juego desde la ruta principal, expone un endpoint de salud en `/health/`, administra archivos estáticos con WhiteNoise y mantiene una configuración de producción parametrizable por variables de entorno.

La experiencia jugable ya está implementada en el frontend: tablero Canvas de 10x10, tráfico, río, troncos, depredadores, cinco metas, niveles progresivos, selección de dificultad, puntaje, vidas, temporizador, rachas, bonus, escudos, partículas y mejor puntaje guardado en `localStorage`.

## Stack tecnológico

| Capa | Tecnología | Uso en el proyecto |
| --- | --- | --- |
| Backend | Python 3.12 + Django 5 | Servir la aplicación web, rutas, templates y health check. |
| Frontend | HTML5, CSS3 y JavaScript | Interfaz responsive, HUD, controles y lógica del juego en Canvas. |
| Runtime web | Gunicorn | Servidor WSGI para producción. |
| Estáticos | WhiteNoise | Entrega de assets estáticos comprimidos y versionados. |
| Base de datos | SQLite | Configuración Django por defecto para desarrollo local. |
| Deploy | Render | Servicio web con build, start command y health check declarados en `render.yaml`. |

## Funcionalidades incluidas

- Proyecto Django funcional con rutas, plantillas, estáticos y endpoint `/health/`.
- Arcade ampliado con autos, río, troncos, cinco metas, depredadores, temporizador, rachas, bonus, escudos, niveles, puntaje, vidas y dificultad.
- Dificultades **Fácil**, **Media** y **Difícil**, con ajustes de velocidad, vidas, tráfico, tiempo y multiplicador de bonus.
- Controles con flechas, WASD, Enter, botones táctiles y gestos de swipe.
- UI responsive con HUD, mensajes de estado y mejor puntaje persistido en `localStorage`.
- Configuración de producción con Gunicorn, WhiteNoise, HTTPS opcional, HSTS configurable y variables para Render.

## Estructura principal

```text
frogger/              Configuración Django, WSGI y URLs principales.
game/                 Vistas de la pantalla principal y health check.
templates/index.html  Template HTML del juego.
static/css/style.css  Estilos responsive de la interfaz.
static/js/game.js     Motor, renderizado Canvas y reglas de juego.
render.yaml           Blueprint de despliegue en Render.
requirements.txt      Dependencias Python.
```

## Desarrollo local

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Luego abrí `http://127.0.0.1:8000/` para jugar. El health check queda disponible en `http://127.0.0.1:8000/health/`.

## Configuración

La aplicación lee la configuración sensible o dependiente del entorno desde variables de entorno:

| Variable | Valor sugerido | Propósito |
| --- | --- | --- |
| `DEBUG` | `False` | Ejecuta Django en modo producción cuando está desactivado. |
| `SECRET_KEY` | valor seguro | Firma criptográfica de Django. |
| `ALLOWED_HOSTS` | `.onrender.com,localhost,127.0.0.1` | Hosts permitidos por Django. |
| `CSRF_TRUSTED_ORIGINS` | `https://*.onrender.com` | Orígenes confiables para formularios/CSRF. |
| `SECURE_SSL_REDIRECT` | `True` en producción | Fuerza HTTPS cuando el proxy ya provee TLS. |
| `SECURE_HSTS_SECONDS` | `31536000` en producción | HSTS por un año. |
| `PYTHON_VERSION` | `3.12.4` | Runtime Python sugerido para Render. |
| `WEB_CONCURRENCY` | `2` | Workers sugeridos para Gunicorn. |

## Deploy en Render

`render.yaml` define un servicio web Python llamado `frogger-complete` con plan free, build command para instalar dependencias y ejecutar `collectstatic`, start command con `gunicorn frogger.wsgi:application` y `/health/` como health check.

Variables incluidas para Render:

| Variable | Valor en `render.yaml` |
| --- | --- |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `.onrender.com` |
| `CSRF_TRUSTED_ORIGINS` | `https://*.onrender.com` |
| `SECRET_KEY` | `generateValue: true` |
| `SECURE_SSL_REDIRECT` | `True` |
| `SECURE_HSTS_SECONDS` | `31536000` |
| `PYTHON_VERSION` | `3.12.4` |
| `WEB_CONCURRENCY` | `2` |

## Checks útiles

```bash
python manage.py check
python manage.py collectstatic --noinput
```
