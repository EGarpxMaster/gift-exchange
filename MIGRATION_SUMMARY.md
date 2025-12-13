# 📋 Resumen de Migración a AppWrite - Gift Exchange 2025

## ✅ Estado Actual: COMPLETADO

La aplicación ha sido migrada exitosamente de Supabase a **AppWrite**.

---

## 🔑 Credenciales de AppWrite

### Para Desarrollo Local (.env)
```env
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=693db0d3003341d76f7b
APPWRITE_API_KEY=standard_c81959ab5611454d3bfd0c4cb3293bf01a4866329d25b64d2c69afef1664fefb040fbf5114d81860063ecc1442145217ffad897a442631c2b2e8f093e620e4f6f9dcde81d83d00790c9f5dbe95e59a47c3e9c7c2d6861080edc27a09af914d3fd6be70f7c6ffdbb1a67c04b4eff2f6f88056f5399f6b73140203b940367e7bcb
APPWRITE_DATABASE_ID=693db75d001e323d20fe
APPWRITE_PARTICIPANTS_COLLECTION_ID=participants
APPWRITE_SETTINGS_COLLECTION_ID=settings
APPWRITE_STORAGE_BUCKET_ID=693db788003b6da3c32d
```

### Para Streamlit Cloud (secrets.toml)
```toml
APPWRITE_ENDPOINT = "https://nyc.cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID = "693db0d3003341d76f7b"
APPWRITE_API_KEY = "standard_c81959ab5611454d3bfd0c4cb3293bf01a4866329d25b64d2c69afef1664fefb040fbf5114d81860063ecc1442145217ffad897a442631c2b2e8f093e620e4f6f9dcde81d83d00790c9f5dbe95e59a47c3e9c7c2d6861080edc27a09af914d3fd6be70f7c6ffdbb1a67c04b4eff2f6f88056f5399f6b73140203b940367e7bcb"
APPWRITE_DATABASE_ID = "693db75d001e323d20fe"
APPWRITE_PARTICIPANTS_COLLECTION_ID = "participants"
APPWRITE_SETTINGS_COLLECTION_ID = "settings"
APPWRITE_STORAGE_BUCKET_ID = "693db788003b6da3c32d"
```

**Archivo disponible en:** `.streamlit/secrets.toml`

---

## 📦 Estructura de AppWrite

### Database: gift_exchange
- **Database ID:** `693db75d001e323d20fe`

### Collections

#### 1. participants
- **Collection ID:** `participants`
- **Atributos:**
  - `encrypted_name` (string, 500 chars)
  - `category` (enum: elite, diversion)
  - `gift_options` (array de strings)
  - `password_hash` (string, 255 chars)
  - `gift_images` (array de strings, opcional)
  - `assigned_to_id` (string, 36 chars, opcional)

#### 2. settings
- **Collection ID:** `settings`
- **Documento fijo:** `global`
- **Atributos:**
  - `encryption_password_hash` (string, 255 chars)
  - `names_revealed` (boolean)
  - `sorteo_completed` (boolean)

### Storage

#### Bucket: gift-images
- **Bucket ID:** `693db788003b6da3c32d`
- **Propósito:** Almacenar imágenes de opciones de regalo
- **Formato:** `{participant_id}_option_{index}`

---

## 🚀 Comandos para Ejecutar Localmente

```bash
# 1. Activar entorno virtual
source venv/bin/activate

# 2. Ejecutar aplicación
streamlit run app.py

# 3. Acceder en navegador
http://localhost:8501
```

---

## ☁️ Despliegue en Streamlit Cloud

### Pasos:

1. **Sube el código a GitHub:**
   ```bash
   git add .
   git commit -m "Migración a AppWrite completada"
   git push origin main
   ```

2. **Ve a Streamlit Cloud:**
   - URL: https://streamlit.io/cloud
   - Click en "New app"
   - Selecciona repositorio: `gift-exchange`
   - Branch: `main`
   - Main file: `app.py`

3. **Configura Secrets:**
   - Ve a "Advanced settings" > "Secrets"
   - Copia y pega el contenido de `.streamlit/secrets.toml`
   - O copia manualmente:
   
   ```toml
   APPWRITE_ENDPOINT = "https://nyc.cloud.appwrite.io/v1"
   APPWRITE_PROJECT_ID = "693db0d3003341d76f7b"
   APPWRITE_API_KEY = "standard_c81959ab5611454d3bfd0c4cb3293bf01a4866329d25b64d2c69afef1664fefb040fbf5114d81860063ecc1442145217ffad897a442631c2b2e8f093e620e4f6f9dcde81d83d00790c9f5dbe95e59a47c3e9c7c2d6861080edc27a09af914d3fd6be70f7c6ffdbb1a67c04b4eff2f6f88056f5399f6b73140203b940367e7bcb"
   APPWRITE_DATABASE_ID = "693db75d001e323d20fe"
   APPWRITE_PARTICIPANTS_COLLECTION_ID = "participants"
   APPWRITE_SETTINGS_COLLECTION_ID = "settings"
   APPWRITE_STORAGE_BUCKET_ID = "693db788003b6da3c32d"
   ```

4. **Deploy:**
   - Click en "Deploy!"
   - Espera unos minutos
   - Tu app estará en: `https://tu-app.streamlit.app`

---

## 📚 Archivos Importantes

### Configuración
- `.env` - Variables de entorno para desarrollo local
- `.streamlit/secrets.toml` - Secrets para Streamlit Cloud
- `requirements.txt` - Dependencias de Python

### Cliente de Base de Datos
- `lib/appwrite_client.py` - Cliente principal de AppWrite
- `lib/firebase_client.py` - Cliente legacy de Firebase
- `lib/supabase_client.py` - Cliente legacy de Supabase

### Scripts de Utilidad
- `setup_appwrite_schema.py` - Crear atributos en collections
- `create_settings_document.py` - Crear documento inicial de settings
- `test_appwrite_connection.py` - Probar conexión a AppWrite

### Documentación
- `APPWRITE_SETUP.md` - Guía completa de AppWrite
- `FIREBASE_SETUP.md` - Documentación legacy de Firebase
- `README.md` - Documentación principal actualizada

---

## 🧪 Probar la Aplicación

### Test de Conexión
```bash
python test_appwrite_connection.py
```

### Crear Participante de Prueba
El script de test ofrece crear un participante de prueba:
- **Nombre:** Test Usuario AppWrite
- **Contraseña:** test123
- **Categoría:** diversion

---

## 🔐 Contraseña de Encriptación

- **Por Defecto:** `GiftExchange2025!`
- **Ubicación:** Almacenada hasheada en `settings.encryption_password_hash`
- **Cambiar:** Desde el Panel de Administrador en la aplicación

---

## 📅 Fechas Importantes

- **Registro:** 4-14 de Diciembre de 2025
- **Sorteo:** 15 de Diciembre de 2025
- **Revelación:** 24 de Diciembre de 2025

---

## 🎯 Próximos Pasos

1. ✅ Aplicación funcionando localmente
2. ✅ Base de datos AppWrite configurada
3. ✅ Schema y documento inicial creados
4. ⏳ **Desplegar en Streamlit Cloud** (siguiente paso)
5. ⏳ Compartir URL con participantes
6. ⏳ Gestionar registro y sorteo

---

## 📞 Soporte

- **AppWrite Console:** https://cloud.appwrite.io/console
- **Documentación AppWrite:** https://appwrite.io/docs
- **Documentación Local:** `APPWRITE_SETUP.md`

---

## 🎉 ¡Listo para Usar!

Tu aplicación está completamente configurada y lista para el intercambio de regalos 2025. 🎄🎁

**Acceso Local:** http://localhost:8501  
**AppWrite Console:** https://cloud.appwrite.io/console
