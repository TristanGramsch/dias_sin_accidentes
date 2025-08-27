Aplicación de Node.js + Express que cuenta los días sin accidentes. Zona horaria de Chile (CLT / America-Santiago).

- Soporte HTTPS mediante certificados `.pem`

## Usar certificados de cPanel localmente

1. Exporta `cert.pem` y `key.pem` desde cPanel
2. Colócalos en la raíz del proyecto **o** define las variables de entorno:

```bash
CERT_PATH=/ruta/cert.pem \
KEY_PATH=/ruta/key.pem \
node server.js
```

Si los archivos no existen el servidor se inicia en HTTP.

```bash
docker build -t dias-sin-accidentes .

docker run -d --name dias-counter \
  -p 443:443 \
  -e PORT=443 \
  -v /ruta/cert.pem:/app/cert.pem \
  -v /ruta/key.pem:/app/key.pem \
  --restart unless-stopped \
  dias-sin-accidentes
```

## Produce una REST API

## Variables en el entorno

- `PORT` – Puerto de escucha (por defecto 443)
- `CERT_PATH` – Ruta personalizada al certificado
- `KEY_PATH` – Ruta personalizada a la llave
- `ADMIN_PASSWORD` – Sobrescribe la contraseña admin por defecto