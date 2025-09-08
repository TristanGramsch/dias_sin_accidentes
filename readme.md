Aplicación de Node.js + Express que cuenta los días sin accidentes. Zona horaria de Santiago de Chile.

- HTTPS DDNS mediante certificados `.pem`

Docker test env
```bash
docker run -d --name dias-test --restart unless-stopped -p 4443:443 -p 8080:8080 -v /home/tristan/dias_sin_accidentes:/app dias-sin-accidentes-test
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