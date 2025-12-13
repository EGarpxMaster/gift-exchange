# 🔥 Configuración de Firebase para Gift Exchange

Este documento explica cómo configurar Firebase para reemplazar Supabase en la aplicación de Intercambio de Regalos.

## 📋 Requisitos

- Cuenta de Google
- Acceso a [Firebase Console](https://console.firebase.google.com/)

## 🚀 Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto" o "Add project"
3. Nombre del proyecto: `gift-exchange-2025` (o el que prefieras)
4. Habilita Google Analytics (opcional)
5. Click en "Crear proyecto"

## 📦 Paso 2: Configurar Firestore Database

1. En la consola de Firebase, ve a **Build > Firestore Database**
2. Click en "Crear base de datos" o "Create database"
3. Selecciona modo de inicio:
   - **Modo de producción** (recomendado para este proyecto)
4. Selecciona ubicación del servidor (elige la más cercana)
5. Click en "Habilitar"

### Estructura de Colecciones

Firebase Firestore es NoSQL, por lo que no necesitas crear tablas. Las colecciones se crean automáticamente cuando insertas el primer documento.

#### Colección: `participants`
Cada documento tendrá:
```json
{
  "encrypted_name": "texto_encriptado...",
  "category": "elite" | "diversion",
  "gift_options": ["opción 1", "opción 2", ...],
  "password_hash": "hash_de_contraseña",
  "gift_images": ["url1", "url2", ...],
  "assigned_to_id": "uuid_del_asignado" | null,
  "created_at": timestamp
}
```

#### Colección: `settings`
Documento con ID fijo `global`:
```json
{
  "encryption_password_hash": "default",
  "names_revealed": false,
  "sorteo_completed": false
}
```

### Reglas de Seguridad de Firestore

1. En **Firestore Database**, ve a la pestaña **Reglas**
2. Reemplaza las reglas con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura a participants
    match /participants/{participantId} {
      allow read, write: if true;
    }
    
    // Permitir lectura/escritura a settings
    match /settings/{settingId} {
      allow read, write: if true;
    }
  }
}
```

3. Click en "Publicar"

> **Nota de Seguridad:** Estas reglas son permisivas para desarrollo. Para producción, considera agregar autenticación.

## 🖼️ Paso 3: Configurar Firebase Storage

1. En la consola de Firebase, ve a **Build > Storage**
2. Click en "Comenzar" o "Get started"
3. Selecciona modo de inicio (Modo de producción)
4. Selecciona la misma ubicación que Firestore
5. Click en "Listo"

### Reglas de Seguridad de Storage

1. En **Storage**, ve a la pestaña **Rules**
2. Reemplaza las reglas con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gift-images/{participantId}/{imageFile} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. Click en "Publicar"

## 🔑 Paso 4: Generar Credenciales de Servicio

1. En la consola de Firebase, click en el ícono de ⚙️ (configuración) > **Configuración del proyecto**
2. Ve a la pestaña **Cuentas de servicio**
3. Click en "Generar nueva clave privada"
4. Se descargará un archivo JSON (por ejemplo: `gift-exchange-2025-firebase-adminsdk-xxxxx.json`)
5. **¡IMPORTANTE!** Guarda este archivo en un lugar seguro y **NUNCA** lo subas a Git

### Ubicar el archivo de credenciales

Opción 1 (Desarrollo local):
```bash
# Crear carpeta para credenciales
mkdir -p ~/.firebase

# Mover el archivo descargado
mv ~/Downloads/gift-exchange-2025-firebase-adminsdk-xxxxx.json ~/.firebase/gift-exchange-credentials.json

# Dar permisos adecuados
chmod 600 ~/.firebase/gift-exchange-credentials.json
```

Opción 2 (En el proyecto, sin subir a Git):
```bash
# Copiar archivo a la raíz del proyecto
cp ~/Downloads/gift-exchange-2025-firebase-adminsdk-xxxxx.json ./firebase-credentials.json

# Agregar a .gitignore
echo "firebase-credentials.json" >> .gitignore
```

## 🔧 Paso 5: Configurar Variables de Entorno

Edita tu archivo `.env` y reemplaza las variables de Supabase:

```env
# VIEJAS VARIABLES DE SUPABASE (eliminar o comentar)
# VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
# VITE_SUPABASE_ANON_KEY=tu_clave_anonima

# NUEVAS VARIABLES DE FIREBASE
FIREBASE_CREDENTIALS_PATH=/home/tu-usuario/.firebase/gift-exchange-credentials.json
FIREBASE_STORAGE_BUCKET=gift-exchange-2025.appspot.com
```

### Obtener el Storage Bucket

El nombre del bucket generalmente es: `TU-PROYECTO-ID.appspot.com`

Para verificarlo:
1. Ve a **Storage** en Firebase Console
2. En la parte superior verás algo como: `gs://gift-exchange-2025.appspot.com`
3. Usa solo la parte después de `gs://`

## 📝 Paso 6: Crear Documento de Settings Inicial (Opcional)

Puedes crear el documento manualmente o dejar que la aplicación lo cree automáticamente:

**Opción manual:**
1. Ve a **Firestore Database** en Firebase Console
2. Click en "Iniciar colección"
3. ID de colección: `settings`
4. Click en "Siguiente"
5. ID de documento: `global`
6. Agregar campos:
   - `encryption_password_hash` (string): `default`
   - `names_revealed` (boolean): `false`
   - `sorteo_completed` (boolean): `false`
7. Click en "Guardar"

**Opción automática:**
La aplicación creará este documento la primera vez que se ejecute.

## ✅ Paso 7: Verificar Configuración

Ejecuta este script de prueba para verificar que todo funciona:

```python
# test_firebase.py
from lib.firebase_client import get_settings, get_participants

try:
    settings = get_settings()
    print("✅ Conexión a Firebase exitosa!")
    print(f"Settings: {settings}")
    
    participants = get_participants()
    print(f"✅ Participantes encontrados: {len(participants)}")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
```

Ejecutar:
```bash
python test_firebase.py
```

## 🚀 Despliegue en Streamlit Cloud

Para desplegar en Streamlit Cloud con Firebase:

1. **Preparar credenciales para producción:**
   - Ve a **Project Settings > Service accounts** en Firebase
   - Copia TODO el contenido del JSON de credenciales

2. **Configurar Secrets en Streamlit Cloud:**
   - En tu app de Streamlit Cloud, ve a **Settings > Secrets**
   - Agrega:
   ```toml
   # Firebase Configuration
   FIREBASE_STORAGE_BUCKET = "gift-exchange-2025.appspot.com"
   
   # Pega aquí el contenido completo del JSON de credenciales
   [firebase_credentials]
   type = "service_account"
   project_id = "gift-exchange-2025"
   private_key_id = "xxxxx"
   private_key = "-----BEGIN PRIVATE KEY-----\nxxxxx\n-----END PRIVATE KEY-----\n"
   client_email = "firebase-adminsdk-xxxxx@gift-exchange-2025.iam.gserviceaccount.com"
   client_id = "xxxxx"
   auth_uri = "https://accounts.google.com/o/oauth2/auth"
   token_uri = "https://oauth2.googleapis.com/token"
   auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs"
   client_x509_cert_url = "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40gift-exchange-2025.iam.gserviceaccount.com"
   universe_domain = "googleapis.com"
   ```

3. **Modificar código para Streamlit Cloud:**
   
   Actualiza `lib/firebase_client.py` para detectar si está en Streamlit Cloud:
   
   ```python
   import streamlit as st
   
   # En producción (Streamlit Cloud), usar secrets
   if 'firebase_credentials' in st.secrets:
       cred_dict = dict(st.secrets['firebase_credentials'])
       cred = credentials.Certificate(cred_dict)
       FIREBASE_STORAGE_BUCKET = st.secrets['FIREBASE_STORAGE_BUCKET']
   else:
       # En desarrollo local, usar archivo
       FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH')
       cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
       FIREBASE_STORAGE_BUCKET = os.getenv('FIREBASE_STORAGE_BUCKET')
   ```

## 🎯 Migrar Datos desde Supabase (si tienes datos existentes)

Si ya tienes datos en Supabase y quieres migrarlos:

1. **Exportar desde Supabase:**
```python
# export_supabase.py
from lib.supabase_client import get_participants, get_settings
import json

participants = get_participants()
settings = get_settings()

with open('supabase_export.json', 'w') as f:
    json.dump({
        'participants': participants,
        'settings': settings
    }, f, indent=2, default=str)

print(f"✅ Exportados {len(participants)} participantes")
```

2. **Importar a Firebase:**
```python
# import_firebase.py
import json
from lib.firebase_client import create_participant, update_settings

with open('supabase_export.json', 'r') as f:
    data = json.load(f)

# Importar settings
settings = data['settings']
update_settings({
    'encryption_password_hash': settings['encryption_password_hash'],
    'names_revealed': settings['names_revealed'],
    'sorteo_completed': settings['sorteo_completed']
})

# Importar participantes
for p in data['participants']:
    create_participant(
        encrypted_name=p['encrypted_name'],
        category=p['category'],
        gift_options=p['gift_options'],
        password_hash=p['password_hash'],
        gift_images=p.get('gift_images', [])
    )

print(f"✅ Importados {len(data['participants'])} participantes")
```

## 📊 Costos de Firebase

Firebase tiene un plan gratuito generoso:

- **Firestore:**
  - 1 GB de almacenamiento
  - 50,000 lecturas/día
  - 20,000 escrituras/día
  - 20,000 eliminaciones/día

- **Storage:**
  - 5 GB de almacenamiento
  - 1 GB de descarga/día

Para una aplicación de intercambio de regalos con ~50 participantes, el plan gratuito es más que suficiente.

## 🔧 Solución de Problemas

### Error: "DefaultCredentialsError"
- Verifica que la ruta en `FIREBASE_CREDENTIALS_PATH` sea correcta
- Verifica que el archivo JSON existe y tiene permisos de lectura

### Error: "Permission denied"
- Revisa las reglas de seguridad de Firestore y Storage
- Asegúrate de que las reglas permiten lectura/escritura

### Error: "Bucket not found"
- Verifica que `FIREBASE_STORAGE_BUCKET` tenga el formato correcto
- Asegúrate de haber habilitado Firebase Storage

### Error al subir imágenes
- Verifica que las reglas de Storage estén configuradas
- Confirma que el bucket existe en Firebase Storage

## 📚 Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Firestore para Python](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
