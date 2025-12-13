# 🚀 Guía Rápida de Inicio - Firebase Version

## Instalación Rápida

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Configurar Firebase
# Sigue la guía completa en FIREBASE_SETUP.md
# Descarga credenciales de Firebase Console

# 3. Configurar variables de entorno
# Crear archivo .env con tus credenciales de Firebase:
echo "FIREBASE_CREDENTIALS_PATH=/ruta/a/firebase-credentials.json" > .env
echo "FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com" >> .env

# 4. Ejecutar la aplicación
streamlit run app.py
```

## Configuración de Firebase (Resumen)

1. Crea proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Firestore Database
3. Habilita Firebase Storage
4. Descarga credenciales JSON (Service Account)
5. Configura variables de entorno

**Ver guía completa:** `FIREBASE_SETUP.md`

## Migrar desde Supabase (Opcional)

Si ya tienes datos en Supabase:

```bash
# Ejecutar script de migración
python migrate_supabase_to_firebase.py
```

## Probar Módulos

```bash
# Probar conexión y encriptación
python -c "from lib.firebase_client import get_settings; print(get_settings())"
```

## Despliegue a Streamlit Cloud

1. Sube tu código a GitHub
2. Ve a https://streamlit.io/cloud
3. Conecta tu repositorio
4. Configura los secrets de Firebase en formato TOML
5. ¡Deploy!

**Ver instrucciones detalladas:** `FIREBASE_SETUP.md` (sección Despliegue)

## Estructura de Archivos

```
gift-exchange/
├── app.py                    # 🎯 Aplicación principal
├── requirements.txt          # 📦 Dependencias
├── .env                      # 🔐 Variables de entorno
├── FIREBASE_SETUP.md        # 📖 Guía completa de Firebase
├── lib/
│   ├── encryption.py        # 🔒 Encriptación AES-256
│   ├── sorteo.py            # 🎲 Algoritmo de sorteo
│   ├── firebase_client.py   # 🔥 Cliente de Firebase
│   └── supabase_client.py   # 💾 Cliente de Supabase (legacy)
└── .streamlit/
    └── config.toml          # 🎨 Configuración de tema
```

## Comandos Útiles

```bash
# Ejecutar con puerto específico
streamlit run app.py --server.port=8502

# Ver logs detallados
streamlit run app.py --logger.level=debug

# Limpiar caché
streamlit cache clear
```

## Notas Importantes

- ✅ Python 3.8+ requerido
- ✅ Firebase configurado (Firestore + Storage)
- ✅ Variables de entorno en `.env`
- ✅ Contraseña por defecto: `GiftExchange2025!`
- ✅ **NUNCA** subir firebase-credentials.json a Git

## Soporte

¿Problemas? Revisa:
- `FIREBASE_SETUP.md` - Configuración completa
- `README.md` - Documentación general
- Firebase Console logs
