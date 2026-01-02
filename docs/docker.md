# Docker Guide

The Dockerfile supports two targets: **development** (with hot reload) and **production** (optimized).

## Development

Build and run with hot reload:

**Linux/macOS:**
```bash
docker build --target development -t motzkin-web:dev .
docker run -p 3000:3000 -v $(pwd)/src:/app/src motzkin-web:dev
```

**Windows PowerShell:**
```powershell
docker build --target development -t motzkin-web:dev .
docker run -p 3000:3000 -v "${PWD}/src:/app/src" motzkin-web:dev
```

**Windows CMD:**
```cmd
docker build --target development -t motzkin-web:dev .
docker run -p 3000:3000 -v "%cd%/src:/app/src" motzkin-web:dev
```

## Production

Build and run optimized image:

```bash
docker build --target production -t motzkin-web:prod .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.example.com motzkin-web:prod
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | Use a different port: `-p 3001:3000` |
| Hot reload not working | Verify volume mount points to `src` directory |
| Can't reach API | Use `host.docker.internal` instead of `localhost` |

For full-stack development, use Docker-Compose from the main project repository.
