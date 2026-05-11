# Guía de Despliegue - GSA Admin Backend

Sigue estos pasos para poner en marcha el backend en tu servidor de producción.

## Requisitos Previos
- Node.js (v20 o superior recomendado)
- NPM
- PM2 (`npm install -g pm2`)

## Pasos para el Despliegue

### 1. Clonar/Copiar Archivos
Sube los archivos a tu servidor (asegúrate de que el `.gitignore` esté funcionando para no subir `node_modules`).

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz de la carpeta `gsa-backend` basándote en el ejemplo:

```bash
cp .env.example .env
nano .env # Edita con tus credenciales de Supabase y tu PIN
```

### 3. Instalar y Compilar
Ejecuta los siguientes comandos para preparar la aplicación:

```bash
npm install        # Instala todas las dependencias
npm run build      # Compila el código TS a la carpeta /dist
```

### 4. Iniciar con PM2
Usa el archivo de configuración `ecosystem` para lanzar el proceso:

```bash
pm2 start ecosystem.config.js
```

## Comandos Útiles de PM2

- **Ver estado**: `pm2 status`
- **Ver logs en tiempo real**: `pm2 logs gsa-admin-backend`
- **Reiniciar app**: `pm2 restart gsa-admin-backend`
- **Detener app**: `pm2 stop gsa-admin-backend`

## Configuración de Dominio y SSL (Nginx)

Si usas Nginx como proxy inverso, sigue estos pasos para configurar tu subdominio:

### 1. Crear el archivo de configuración
Ve a la carpeta de sitios disponibles y crea uno nuevo (puedes copiar uno existente):
```bash
cd /etc/nginx/sites-available/
cp notify.gestorianegocios.com admin.gestorianegocios.com
```

### 2. Editar y Limpiar
Abre el archivo y asegúrate de:
- Cambiar `server_name` a `admin.gestorianegocios.com`.
- Cambiar el puerto en `proxy_pass` al puerto de tu backend (ej: `4000`).
- **IMPORTANTE**: Si copiaste el archivo, borra las líneas de SSL antiguas y el bloque de redirección 301 para evitar conflictos con Certbot.

### 3. Activar el sitio
Crea el enlace simbólico hacia `sites-enabled`:
```bash
ln -s /etc/nginx/sites-available/admin.gestorianegocios.com /etc/nginx/sites-enabled/
```

### 4. Validar y Reiniciar Nginx
```bash
nginx -t             # Verifica que no haya errores de sintaxis
systemctl reload nginx # Aplica los cambios
```

### 5. Generar SSL con Certbot
```bash
certbot --nginx -d admin.gestorianegocios.com
```

## Notas Adicionales
- El archivo `sections.json` se creará automáticamente en la raíz con las secciones por defecto al iniciar por primera vez.
- Si actualizas el código, recuerda ejecutar `npm run build` y luego `pm2 restart gsa-admin-backend` para aplicar los cambios.
