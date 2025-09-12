Aplicación de Node.js + Express que cuenta los días sin accidentes. Zona horaria de Santiago de Chile.

- HTTPS DDNS mediante certificados `.pem`

Test
```bash
# Build image
docker build -t dias-sin-accidentes:test .
# Make entry point executable
chmod +x /home/tristan/dias_sin_accidentes/entrypoint.sh
# Remove previous container
docker rm -f dias-test || true
# Run image (note: do NOT mount the project read-only; the app writes to /app/data.json)
docker run -d --name dias-test --restart unless-stopped \
  -p 4443:443 -p 8080:8080 \
  -v /home/tristan/dias_sin_accidentes:/app \
  -v /home/tristan/dias_sin_accidentes/entrypoint.sh:/entrypoint.sh:ro \
  -e CERT_PATH="/app/Certificate.pem" \
  -e KEY_PATH="/app/Private Key.pem" \
  -e CA_PATH="/app/Certificate Authority Bundle.pem" \
  dias-sin-accidentes:test
```

Production 
```bash
# Make entry point executable
chmod +x /home/pi/dias_sin_accidentes/entrypoint.sh
# Build using local daemon (for arm64 base)
sudo docker build -t dias-sin-accidentes:prod /home/pi/dias_sin_accidentes
# Remove previous container
sudo docker rm -f dias-sin-accidentes || true
# Run image
# First port HTTPS mapped. Second HTTP fallback.
sudo docker run -d --name dias-sin-accidentes --restart unless-stopped \
  -p 443:443 -p 8080:8080 \
  -v /home/pi/dias_sin_accidentes/entrypoint.sh:/entrypoint.sh:ro \
  -v /home/pi/dias_sin_accidentes/cert.pem:/app/cert.pem:ro \
  -v /home/pi/dias_sin_accidentes/key.pem:/app/key.pem:ro \
  -v /home/pi/dias_sin_accidentes/ca.pem:/app/ca.pem:ro \
  -e CERT_PATH="/app/cert.pem" -e KEY_PATH="/app/key.pem" -e CA_PATH="/app/ca.pem" \
  dias-sin-accidentes:prod
```

Explanation:
docker run: create and run a new container.
-d: run detached (in background).
--name dias-test: set container name to dias-test.
--restart unless-stopped: restart container automatically unless you stop it manually (survives reboots).
-p 4443:443: map host port 4443 to container port 443 (external clients connect to 4443).
-p 8080:8080: map host port 8080 to container port 8080 (HTTP fallback/static).
-v /home/tristan/dias_sin_accidentes:/app: mount your project directory into the container so the container uses the .pem cert files and current code.
dias-sin-accidentes-test: image name to run.