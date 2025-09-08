Aplicación de Node.js + Express que cuenta los días sin accidentes. Zona horaria de Santiago de Chile.

- HTTPS DDNS mediante certificados `.pem`

Node

```bash
CERT_PATH=/ruta/cert.pem \
KEY_PATH=/ruta/key.pem \
node server.js
```

Docker

```bash
docker build -t dias-sin-accidentes . && 
docker run -d --name dias-counter -p 8080:8080 --restart unless-stopped dias-sin-accidentes
```