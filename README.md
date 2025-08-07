# Días sin Accidentes (CLT Edition)

Pequeña aplicación Node.js + Express que cuenta los días sin accidentes, usando la zona horaria de Chile (CLT / America-Santiago) para todos los cálculos y visualizaciones.

## Características

- Contador en vivo que se incrementa cada medianoche (CLT)
- Panel de administración protegido por contraseña para actualizar o reiniciar el contador
- Interfaz web responsive
- Soporte HTTPS mediante certificados `.pem` (rutas configurables)
- Lista para Docker (Raspberry Pi u otros hosts Linux)

## Inicio rápido (Desarrollo)

```bash
# Clonar y cambiar a la rama de desarrollo
git clone <repo-url>
cd dias_sin_accidentes
git checkout development

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (HTTP si no hay certs)
PORT=443 node server.js
```

### Usar certificados de cPanel localmente

1. Exporta `cert.pem` y `key.pem` desde cPanel
2. Colócalos en la raíz del proyecto **o** define las variables de entorno:

```bash
CERT_PATH=/ruta/cert.pem \
KEY_PATH=/ruta/key.pem \
node server.js
```

Si los archivos no existen el servidor se inicia en HTTP, permitiendo desarrollo sin HTTPS.

## Producción con Docker

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

## API REST

| Método | Endpoint              | Descripción                          |
|--------|-----------------------|--------------------------------------|
| GET    | /api/counter          | Obtiene el contador y timestamps     |
| POST   | /api/counter/update   | Actualiza los días (solo admin)      |
| POST   | /api/counter/reset    | Reinicia a 0 (solo admin)            |

Cuerpo para rutas protegidas:

```json
{
  "password": "jefecito",
  "dias": 10        // solo para /update
}
```

## Variables de entorno

- `PORT` – Puerto de escucha (por defecto 443)
- `CERT_PATH` – Ruta personalizada al certificado
- `KEY_PATH` – Ruta personalizada a la llave
- `ADMIN_PASSWORD` – Sobrescribe la contraseña admin por defecto

## Licencia
MIT 