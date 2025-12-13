# 🚀 Configuración de AppWrite para Gift Exchange

Este documento explica cómo configurar AppWrite para la aplicación de Intercambio de Regalos.

## 📋 Requisitos

- Cuenta en [AppWrite Cloud](https://cloud.appwrite.io/) o instalación self-hosted
- Los datos de conexión ya proporcionados

## 🔑 Datos de Conexión Actuales

Ya tienes:
- ✅ **Endpoint**: `https://nyc.cloud.appwrite.io/v1`
- ✅ **API Key**: Proporcionada
- ✅ **Database**: `gift_exchange` creada
- ✅ **Collections**: `participants` y `settings` creadas

## 📝 Información Adicional Necesaria

Para completar la configuración, necesitas obtener de AppWrite Console:

### 1. Project ID
- Ve a: **AppWrite Console > Settings**
- Copia el **Project ID**

### 2. Database ID
- Ve a: **Databases > gift_exchange**
- Click en el ícono de ⚙️ (Settings)
- Copia el **Database ID**

### 3. Collection IDs

#### Participants Collection
- Ve a: **Databases > gift_exchange > participants**
- Click en Settings (⚙️)
- Copia el **Collection ID**

#### Settings Collection
- Ve a: **Databases > gift_exchange > settings**
- Click en Settings (⚙️)
- Copia el **Collection ID**

### 4. Storage Bucket ID (Opcional - para imágenes)
- Ve a: **Storage**
- Si no tienes un bucket, créalo:
  - Click en "Create bucket"
  - Name: `gift-images`
  - Max file size: `10MB` (10485760 bytes)
  - Allowed file extensions: `jpg,jpeg,png,gif,webp`
  - Compression: `gzip`
  - Encryption: Enabled
  - Antivirus: Enabled (si está disponible)
- Copia el **Bucket ID**

## 🔧 Configurar Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
# AppWrite Configuration
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=tu_project_id_aqui
APPWRITE_API_KEY=standard_c81959ab5611454d3bfd0c4cb3293bf01a4866329d25b64d2c69afef1664fefb040fbf5114d81860063ecc1442145217ffad897a442631c2b2e8f093e620e4f6f9dcde81d83d00790c9f5dbe95e59a47c3e9c7c2d6861080edc27a09af914d3fd6be70f7c6ffdbb1a67c04b4eff2f6f88056f5399f6b73140203b940367e7bcb
APPWRITE_DATABASE_ID=tu_database_id_aqui
APPWRITE_PARTICIPANTS_COLLECTION_ID=participants_collection_id
APPWRITE_SETTINGS_COLLECTION_ID=settings_collection_id
APPWRITE_STORAGE_BUCKET_ID=gift_images_bucket_id
```

## 📊 Estructura de las Collections

### Collection: `participants`

**Attributes (campos que deben existir):**

| Attribute Key      | Type    | Size    | Required | Array | Default |
|--------------------|---------|---------|----------|-------|---------|
| encrypted_name     | string  | 500     | Yes      | No    | -       |
| category           | enum    | -       | Yes      | No    | -       |
| gift_options       | string  | -       | Yes      | Yes   | []      |
| password_hash      | string  | 255     | Yes      | No    | -       |
| gift_images        | string  | -       | No       | Yes   | []      |
| assigned_to_id     | string  | 36      | No       | No    | null    |

**Enum values para `category`:**
- `elite`
- `diversion`

**Indexes (para mejorar rendimiento):**
- `encrypted_name` - Type: Key, Attribute: encrypted_name, Order: ASC
- `category` - Type: Key, Attribute: category, Order: ASC

### Collection: `settings`

**Attributes (campos que deben existir):**

| Attribute Key              | Type    | Size | Required | Default   |
|----------------------------|---------|------|----------|-----------|
| encryption_password_hash   | string  | 255  | Yes      | "default" |
| names_revealed             | boolean | -    | Yes      | false     |
| sorteo_completed           | boolean | -    | Yes      | false     |

**Documento inicial:**
Crea manualmente un documento con ID `global`:
```json
{
  "$id": "global",
  "encryption_password_hash": "default",
  "names_revealed": false,
  "sorteo_completed": false
}
```

## 🔒 Configurar Permisos

### Permisos para `participants` collection:

**Read Access:**
- [x] Any (permitir lectura a cualquiera)

**Create Access:**
- [x] Any (permitir creación a cualquiera)

**Update Access:**
- [x] Any (permitir actualización a cualquiera)

**Delete Access:**
- [x] Any (permitir eliminación a cualquiera)

> **Nota de Seguridad:** Estos permisos son permisivos para simplificar el desarrollo. Para producción, considera implementar autenticación con AppWrite Auth y ajustar permisos por usuario.

### Permisos para `settings` collection:

**Read Access:**
- [x] Any

**Update Access:**
- [x] Any

## 🖼️ Configurar Storage Bucket

### Crear bucket `gift-images`:

1. Ve a **Storage** en AppWrite Console
2. Click en "Create bucket"
3. Configuración:
   - **Name**: `gift-images`
   - **Bucket ID**: Puedes especificar `giftImages` o dejar que se genere automáticamente
   - **Permissions**:
     - Read: Any
     - Create: Any
     - Update: Any
     - Delete: Any
   - **Max file size**: `10485760` (10 MB)
   - **Allowed file extensions**: `jpg,jpeg,png,gif,webp`
   - **Compression**: `gzip`
   - **Encryption**: Enabled
   - **Antivirus**: Enabled (si disponible)
4. Click en "Create"

## ✅ Verificar Configuración

Ejecuta este script para verificar que todo funciona:

```bash
python test_appwrite_connection.py
```

El script verificará:
- ✅ Conexión a AppWrite
- ✅ Acceso a la base de datos
- ✅ Lectura de collections
- ✅ Acceso a Storage

## 🚀 Despliegue en Streamlit Cloud

Para desplegar en Streamlit Cloud:

1. **En Streamlit Cloud > Settings > Secrets**, agrega:

```toml
# AppWrite Configuration
APPWRITE_ENDPOINT = "https://nyc.cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID = "tu_project_id"
APPWRITE_API_KEY = "tu_api_key_completa"
APPWRITE_DATABASE_ID = "tu_database_id"
APPWRITE_PARTICIPANTS_COLLECTION_ID = "participants_id"
APPWRITE_SETTINGS_COLLECTION_ID = "settings_id"
APPWRITE_STORAGE_BUCKET_ID = "gift_images_id"
```

2. **Deploy** la aplicación

## 🔄 Migrar Datos Existentes

Si tienes datos en Supabase o Firebase:

```bash
# Asegúrate de tener ambas configuraciones en .env
python migrate_to_appwrite.py
```

## 📱 Acceder a AppWrite Console

- **URL**: https://cloud.appwrite.io/console
- Tu proyecto debería aparecer en el dashboard
- Desde ahí puedes monitorear:
  - Documentos en Collections
  - Archivos en Storage
  - Logs de API
  - Métricas de uso

## 🐛 Solución de Problemas

### Error: "Project not found"
- Verifica que `APPWRITE_PROJECT_ID` sea correcto
- Verifica que tu API Key tenga permisos de acceso al proyecto

### Error: "Database not found"
- Verifica que `APPWRITE_DATABASE_ID` sea correcto
- Asegúrate de que la base de datos `gift_exchange` exista

### Error: "Collection not found"
- Verifica los IDs de las collections
- Asegúrate de que las collections `participants` y `settings` existan

### Error: "Attribute not found"
- Verifica que todos los atributos listados arriba estén creados
- Los nombres deben coincidir exactamente (case-sensitive)

### Error al subir imágenes
- Verifica que `APPWRITE_STORAGE_BUCKET_ID` esté configurado
- Asegúrate de que el bucket existe y tiene permisos correctos
- Verifica las extensiones permitidas

## 📚 Recursos Adicionales

- [Documentación de AppWrite](https://appwrite.io/docs)
- [AppWrite Python SDK](https://appwrite.io/docs/sdks#python)
- [AppWrite Community](https://appwrite.io/community)

## 💰 Costos de AppWrite Cloud

AppWrite Cloud tiene un plan gratuito generoso:

- **Bandwidth**: 75 GB/mes
- **Users**: Ilimitados
- **Database**: 2 GB
- **Storage**: 5 GB
- **Executions**: 750K/mes

Para una aplicación de intercambio de regalos con ~50 participantes, el plan gratuito es más que suficiente.
