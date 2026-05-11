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
- **Eliminar de la lista**: `pm2 delete gsa-admin-backend`

## Notas Adicionales
- El archivo `sections.json` se creará automáticamente en la raíz con las secciones por defecto al iniciar por primera vez.
- Si actualizas el código, recuerda ejecutar `npm run build` y luego `pm2 restart gsa-admin-backend` para aplicar los cambios.
