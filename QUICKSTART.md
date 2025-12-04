# 🚀 Guía Rápida de Inicio - Streamlit Version

## Instalación Rápida

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Configurar variables de entorno
# Crear archivo .env con tus credenciales de Supabase:
echo "VITE_SUPABASE_URL=https://tu-proyecto.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=tu_clave_anonima" >> .env

# 3. Ejecutar la aplicación
streamlit run app.py
```

## Probar Módulos

```bash
# Probar encriptación y sorteo
python test_modules.py
```

## Despliegue a Streamlit Cloud

1. Sube tu código a GitHub
2. Ve a https://streamlit.io/cloud
3. Conecta tu repositorio
4. Configura los secrets (variables de entorno)
5. ¡Deploy!

## Estructura de Archivos

```
gift-exchange/
├── app.py                    # 🎯 Aplicación principal
├── requirements.txt          # 📦 Dependencias
├── .env                      # 🔐 Variables de entorno
├── lib/
│   ├── encryption.py        # 🔒 Encriptación AES-256
│   ├── sorteo.py            # 🎲 Algoritmo de sorteo
│   └── supabase_client.py   # 💾 Cliente de BD
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
- ✅ Supabase configurado con el schema en `supabase/schema.sql`
- ✅ Variables de entorno en `.env`
- ✅ Contraseña por defecto: `GiftExchange2025!`

## Soporte

¿Problemas? Revisa el archivo `README_STREAMLIT.md` completo.
