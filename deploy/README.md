# Despliegue Docker

Infraestructura base para produccion futura de la plataforma. El frontend se construye en un contenedor Nginx independiente y los backends de juegos se levantan como servicios separados.

## Servicios

- `web`: build de Vite servido por Nginx, con proxy a APIs internas.
- `wikipedia-gacha-backend`: Node en el puerto interno `8791`, con Postgres y Redis.
- `penalty-shootout-backend`: Node en el puerto interno `8792`.
- `cosmic-vanguard-backend`: Node en el puerto interno `8793`.  
- `db`: Postgres 16 para estado persistente.
- `redis`: cache compartida para backends que lo soporten.
- `certbot`: renovacion periodica de certificados.

## Puesta en marcha

```bash
cp deploy/.env.example deploy/.env
```

Edita `deploy/.env` y cambia `DOMAIN`, `SITE_URL`, `LETSENCRYPT_EMAIL`, `POSTGRES_PASSWORD` y `WIKIPEDIA_GACHA_TOKEN_SECRET`.

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d --build
```

El contenedor `web` crea un certificado autofirmado temporal en una ruta separada si todavia no hay certificados de Let's Encrypt, para que Nginx pueda arrancar desde el primer `up`. La ruta `/etc/letsencrypt` queda reservada exclusivamente para Certbot.

## Renovacion y continuidad HTTPS

- Certbot comprueba la renovacion dos veces al dia, antes de que el certificado se acerque a su caducidad.
- Si una comprobacion falla por un problema temporal de red, DNS o proveedor, vuelve a intentarlo cada 15 minutos hasta que funcione.
- El contenedor `web` vigila el volumen de certificados. Cuando Certbot instala uno nuevo, valida la configuracion con `nginx -t` y hace una recarga gradual de Nginx sin cortar las conexiones activas.
- El certificado anterior sigue sirviendose mientras la renovacion o la validacion del nuevo certificado falla.

Let's Encrypt es gratuito y sus certificados se solicitan con margen antes de caducar. Un retraso de unos minutos u horas en una renovacion no deberia interrumpir HTTPS con esta configuracion.

Esta proteccion no puede mantener la web disponible si el proveedor suspende o apaga por completo el VPS, el dominio o la red por un pago rechazado. Para ese caso se debe activar renovacion automatica, un metodo de pago alternativo y alertas de facturacion en el proveedor.

## Emitir el certificado real

Antes de emitir el certificado real de Let's Encrypt, comprueba que:

- El DNS de `DOMAIN` y `www.DOMAIN` apunta correctamente a la IP del servidor.
- Los puertos `80` y `443` están abiertos en el firewall del VPS/proveedor.
- El servicio `web` está levantado, ya que Certbot usará el modo `webroot` sobre `/var/www/certbot`.
- El fichero `deploy/.env` contiene al menos estas variables:

```env
DOMAIN=game-lock.com
SITE_URL=https://www.game-lock.com
LETSENCRYPT_EMAIL=gamelockweb@gmail.com
```

> Importante: `deploy/.env` no debe subirse al repositorio si contiene secretos reales.

### 1. Cargar las variables desde `deploy/.env`

Se cargan `DOMAIN` y `LETSENCRYPT_EMAIL` de forma robusta, permitiendo espacios, comillas o saltos de línea tipo Windows:

```bash
DOMAIN="$(grep -E '^[[:space:]]*DOMAIN[[:space:]]*=' deploy/.env | tail -n1 | sed -E 's/^[[:space:]]*DOMAIN[[:space:]]*=[[:space:]]*//; s/[[:space:]]*$//; s/^"//; s/"$//; s/\r//g')"

LETSENCRYPT_EMAIL="$(grep -E '^[[:space:]]*LETSENCRYPT_EMAIL[[:space:]]*=' deploy/.env | tail -n1 | sed -E 's/^[[:space:]]*LETSENCRYPT_EMAIL[[:space:]]*=[[:space:]]*//; s/[[:space:]]*$//; s/^"//; s/"$//; s/\r//g')"

echo "DOMAIN=[$DOMAIN]"
echo "LETSENCRYPT_EMAIL=[$LETSENCRYPT_EMAIL]"
```

La salida esperada debe ser similar a:

```bash
DOMAIN=[game-lock.com]
LETSENCRYPT_EMAIL=[gamelockweb@gmail.com]
```

Si `DOMAIN=[]` o `LETSENCRYPT_EMAIL=[]`, revisa el fichero `deploy/.env` antes de continuar.

### 2. Emitir el certificado con Certbot

El servicio `certbot` del `docker-compose.yml` está preparado para ejecutar renovaciones periódicas mediante `/bin/sh`.

Por eso, para emitir el certificado inicial manualmente, se sobrescribe el entrypoint con `--entrypoint certbot`:

```bash
test -n "$DOMAIN" || { echo "ERROR: DOMAIN está vacío"; exit 1; }
test -n "$LETSENCRYPT_EMAIL" || { echo "ERROR: LETSENCRYPT_EMAIL está vacío"; exit 1; }

docker compose --env-file deploy/.env -f deploy/docker-compose.yml run --rm \
  --entrypoint certbot \
  certbot certonly \
  --webroot \
  -w /var/www/certbot \
  --cert-name "$DOMAIN" \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --email "$LETSENCRYPT_EMAIL" \
  --agree-tos \
  --no-eff-email \
&& docker compose --env-file deploy/.env -f deploy/docker-compose.yml restart web
```

Si todo está correcto, Certbot mostrará una salida parecida a:

```bash
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/game-lock.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/game-lock.com/privkey.pem
```

El certificado se emite con el nombre definido en `$DOMAIN`, por ejemplo `game-lock.com`, y cubre tanto el dominio principal como el subdominio `www` mediante SAN:

- `game-lock.com`
- `www.game-lock.com`

### 3. Reiniciar el servicio web si es necesario

Si el reinicio no se completa correctamente o quieres forzarlo manualmente:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml restart web
```

### 4. Dejar activo el servicio permanente de Certbot

La emisión inicial se hace con un contenedor temporal mediante `run --rm`.

Después, conviene asegurarse de que el servicio permanente de Certbot queda levantado para comprobar renovaciones automáticamente:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d certbot
```

Comprueba el estado de los servicios:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml ps
```

Deberías ver el contenedor `plataforma-juegos-certbot` en ejecución.

### 5. Verificar HTTPS

Comprueba que ambos dominios responden por HTTPS:

```bash
curl -I https://game-lock.com
curl -I https://www.game-lock.com
```

También puedes inspeccionar el certificado servido por Nginx:

```bash
echo | openssl s_client -connect game-lock.com:443 -servername game-lock.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

### 6. Dominio canónico para SEO

Nginx sirve ambos hosts:

```nginx
server_name ${DOMAIN} www.${DOMAIN};
```

El origen canónico para SEO lo define `SITE_URL`.

Si el dominio canónico debe ser `www`, en `deploy/.env` debe quedar así:

```env
SITE_URL=https://www.game-lock.com
```

Como `SITE_URL` se pasa como argumento de build al contenedor `web`, si cambias esta variable debes reconstruir el servicio:

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.yml build web
docker compose --env-file deploy/.env -f deploy/docker-compose.yml up -d web
```

## Notas

- No se incluyen tests, resultados de pruebas, `node_modules`, `tmp`, `output` ni bases SQLite de benchmark en el contexto Docker.
- `wikipedia-gacha-backend` inicializa su esquema Postgres al arrancar.
- Los backends no publican puertos al host; solo `web` expone `80` y `443`.
- Si `POSTGRES_PASSWORD` contiene caracteres reservados de URL como `@`, `/`, `:` o `#`, usa una version URL-encoded o limita el secreto a caracteres alfanumericos largos.
