# Configuración del Bucket de Supabase Storage

## Paso 1: Crear el Bucket

1. **Acceder a Supabase Dashboard**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto

2. **Crear el Bucket**
   - En el menú lateral, selecciona **Storage**
   - Click en **"New bucket"**
   - Configuración:
     - **Name:** `gift-images`
     - **Public bucket:** ✅ **SÍ** (marca esta opción para que las imágenes sean accesibles públicamente)
     - **File size limit:** 5MB (opcional)
     - **Allowed MIME types:** Dejar en blanco (permitirá todos los tipos)
   - Click en **"Create bucket"**

## Paso 2: Configurar Políticas de Seguridad (RLS)

1. **Ir al SQL Editor**
   - En el menú lateral de Supabase, selecciona **SQL Editor**
   - Click en **"New query"**

2. **Ejecutar el script de políticas**
   - Copia y pega el contenido del archivo `supabase/storage_policies.sql`
   - Click en **"Run"** o presiona `Ctrl+Enter`

3. **Verificar que las políticas se crearon**
   - Ve a **Storage** > **Policies**
   - Deberías ver 4 políticas para el bucket `gift-images`:
     - ✅ Permitir subida de imágenes (INSERT)
     - ✅ Permitir lectura pública de imágenes (SELECT)
     - ✅ Permitir actualización de imágenes (UPDATE)
     - ✅ Permitir eliminación de imágenes (DELETE)

## Paso 3: Aplicar Migración de Base de Datos

1. **Ir al SQL Editor** (si no estás ya ahí)
   - En el menú lateral de Supabase, selecciona **SQL Editor**
   - Click en **"New query"**

2. **Ejecutar la migración**
   - Copia y pega el contenido de `supabase/migration_password_images.sql`
   - Click en **"Run"**

3. **Verificar las columnas nuevas**
   - Ve a **Table Editor** > Tabla `participants`
   - Deberías ver las nuevas columnas:
     - `password_hash` (TEXT)
     - `gift_images` (TEXT[])

## Paso 4: Verificar la Configuración

1. **Probar subida de imágenes**
   - Ve a **Storage** > `gift-images`
   - Intenta subir una imagen manualmente
   - Si funciona, la configuración es correcta

2. **Verificar acceso público**
   - Sube una imagen de prueba
   - Click derecho en la imagen > "Copy URL"
   - Pega la URL en una nueva pestaña del navegador
   - Si se muestra la imagen, el bucket es público correctamente

## Estructura de Almacenamiento

Las imágenes se guardan con la siguiente estructura:
```
gift-images/
  ├── {participant_id}/
  │   ├── option_0.jpg
  │   ├── option_1.png
  │   ├── option_2.webp
  │   └── ...
  └── {otro_participant_id}/
      └── option_0.jpg
```

## Troubleshooting

### ❌ Error: "new row violates row-level security policy"
- **Solución:** Asegúrate de que las políticas RLS estén activas. Ejecuta nuevamente `storage_policies.sql`

### ❌ Las imágenes no se muestran (403 Forbidden)
- **Solución:** El bucket debe ser público. Ve a Storage > gift-images > Settings > Make public

### ❌ Error al subir: "Bucket not found"
- **Solución:** Verifica que el bucket se llame exactamente `gift-images` (sin espacios ni mayúsculas)

### ❌ Error: "File size exceeds maximum"
- **Solución:** Reduce el tamaño de la imagen o aumenta el límite en Settings del bucket

## Comandos SQL Útiles

**Ver todas las políticas del bucket:**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';
```

**Eliminar todas las políticas (para empezar de nuevo):**
```sql
DROP POLICY IF EXISTS "Permitir subida de imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública de imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización de imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación de imágenes" ON storage.objects;
```

**Ver todos los archivos en el bucket:**
```sql
SELECT name, bucket_id, created_at 
FROM storage.objects 
WHERE bucket_id = 'gift-images';
```
