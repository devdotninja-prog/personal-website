# Personal Website

A static one-page site. The home page shows one line of text.

## Run with Docker

```bash
docker compose up --build
```

Open `http://localhost:8080`.

## Run without Docker

The site is static. Serve the folder with any HTTP server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Stack

- HTML, CSS, and a few lines of vanilla JavaScript
- [Instrument Serif](https://github.com/Instrument/instrument-serif) (SIL OFL), self-hosted in `fonts/`
- Nginx in Docker (`Dockerfile`, `default.conf`, `docker-compose.yml`)
