# 🎄 Intercambio de Regalos 2025 - Streamlit App

Aplicación web construida con **Streamlit** para gestionar el intercambio de regalos de fin de año con encriptación de nombres y sorteo automático.

## 🎁 Características Principales

- **Interfaz Intuitiva con Streamlit:** Fácil de usar y desplegar
- **Encriptación de Nombres:** Los nombres de los participantes se encriptan con AES-256-GCM
- **Sorteo Automático:** Algoritmo que garantiza que nadie se toque a sí mismo y no haya intercambios equivalentes
- **Gestión por Categorías:** Élite ($1,000 MXN) y Diversión ($500 MXN)
- **Panel de Administrador:** Control total del sorteo, encriptación y revelación de nombres
- **Validación de Fechas:** Registro solo del 4 al 14 de diciembre, revelación el 24 de diciembre
- **Base de Datos Supabase:** Conexión directa y segura a PostgreSQL
- **Tema Navideño:** Diseño festivo con colores de temporada

## 🚀 Configuración Inicial

### 1. Requisitos Previos

- Python 3.8 o superior
- Cuenta en [Supabase](https://supabase.com/)

### 2. Base de Datos (Supabase)

1. Crea un nuevo proyecto en [Supabase](https://supabase.com/)
2. Ve al **SQL Editor** y ejecuta el script completo que se encuentra en `supabase/schema.sql`
3. Verifica que se crearon las tablas:
   - `participants` (con nombres encriptados)
   - `settings` (configuración global)
4. Obtén tus credenciales en **Project Settings > API**:
   - `Project URL`
   - `anon public` key

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

### 4. Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/gift-exchange.git
cd gift-exchange

# Instalar dependencias
pip install -r requirements.txt
```

### 5. Ejecución Local

```bash
# Ejecutar la aplicación
streamlit run app.py
```

La aplicación estará disponible en `http://localhost:8501`

## 🌐 Despliegue en Streamlit Cloud

### Opción 1: Despliegue Automático (Recomendado)

1. **Sube tu código a GitHub:**
   ```bash
   git add .
   git commit -m "Aplicación Streamlit lista"
   git push origin main
   ```

2. **Ve a [Streamlit Cloud](https://streamlit.io/cloud):**
   - Inicia sesión con tu cuenta de GitHub
   - Click en "New app"
   - Selecciona tu repositorio: `gift-exchange`
   - Branch: `main`
   - Main file path: `app.py`

3. **Configura las variables de entorno:**
   - En "Advanced settings" > "Secrets"
   - Agrega tu archivo `.env` completo:
     ```toml
     VITE_SUPABASE_URL = "https://tu-proyecto.supabase.co"
     VITE_SUPABASE_ANON_KEY = "tu_clave_anonima_aqui"
     ```

4. **Deploy:**
   - Click en "Deploy!"
   - Tu app estará disponible en: `https://tu-app.streamlit.app`

### Opción 2: Despliegue en Otras Plataformas

#### Render.com

```bash
# Crear archivo render.yaml en la raíz
```

```yaml
services:
  - type: web
    name: gift-exchange
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: streamlit run app.py --server.port=$PORT --server.address=0.0.0.0
    envVars:
      - key: VITE_SUPABASE_URL
        value: https://tu-proyecto.supabase.co
      - key: VITE_SUPABASE_ANON_KEY
        value: tu_clave_anonima_aqui
```

#### Heroku

```bash
# Crear Procfile
echo "web: streamlit run app.py --server.port=$PORT --server.address=0.0.0.0" > Procfile

# Desplegar
heroku create gift-exchange-app
heroku config:set VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
heroku config:set VITE_SUPABASE_ANON_KEY="tu_clave_anonima_aqui"
git push heroku main
```

## 📋 Flujo de Uso

### Para Participantes

1. **Registro (4-14 Diciembre):**
   - Ingresar nombre completo (se encriptará automáticamente)
   - Seleccionar categoría (Élite o Diversión)
   - Agregar mínimo 5 opciones de regalo
   - El sistema valida que no haya duplicados

2. **Post-Sorteo (15-23 Diciembre):**
   - Acceder al dashboard con tu ID de participante
   - Ver la lista de deseos de tu asignación
   - El nombre permanece oculto hasta el 24 de diciembre

3. **Revelación (24 Diciembre):**
   - Ver el nombre de tu amigo secreto
   - ¡Preparar el regalo perfecto!

### Para Administradores

1. **Acceder al Panel de Admin:**
   - Ir a la aplicación y seleccionar "Panel de Admin"

2. **Ejecutar el Sorteo:**
   - Click en "Realizar Sorteo" (después del 14 de diciembre)
   - El algoritmo asigna automáticamente y valida las restricciones

3. **Cambiar Contraseña de Encriptación (Opcional):**
   - Cambiar la contraseña por defecto por una personalizada
   - **IMPORTANTE:** Guardar la nueva contraseña en lugar seguro

4. **Revelar Nombres:**
   - Click en "Revelar Ahora" cuando sea el momento
   - Los participantes verán los nombres en su dashboard

## 🔒 Seguridad

- **Encriptación AES-256-GCM:** Nombres protegidos con estándar militar
- **PBKDF2:** Derivación de claves con 100,000 iteraciones
- **RLS en Supabase:** Row Level Security habilitado
- **Variables de entorno:** Credenciales nunca en el código

## 🛠️ Estructura del Proyecto

```
gift-exchange/
├── app.py                      # Aplicación principal de Streamlit
├── requirements.txt            # Dependencias de Python
├── .env                        # Variables de entorno (NO subir a Git)
├── .streamlit/
│   └── config.toml            # Configuración del tema
├── lib/
│   ├── encryption.py          # Módulo de encriptación AES-256-GCM
│   ├── sorteo.py              # Algoritmo de sorteo
│   └── supabase_client.py     # Cliente de Supabase
└── supabase/
    └── schema.sql             # Esquema de la base de datos
```

## 🧪 Testing Local

```bash
# Ejecutar con fecha simulada
# La aplicación incluye botones de desarrollo para simular fechas

# Simular registro abierto (10 de diciembre)
# Click en "Simular 10 de Diciembre" en el formulario

# Simular revelación (25 de diciembre)
# Click en "Simular 25 de Diciembre" en el dashboard
```

## 🐛 Solución de Problemas

### Error de conexión a Supabase
```
Verificar que las variables de entorno estén correctamente configuradas
Asegurarse de que el proyecto de Supabase esté activo
```

### Error de encriptación
```
La contraseña por defecto es: GiftExchange2025!
Si se cambió, usar la nueva contraseña en el admin panel
```

### App no carga en Streamlit Cloud
```
Verificar que requirements.txt esté completo
Revisar los logs en Streamlit Cloud
Confirmar que los secrets estén configurados
```

## 📝 Notas Importantes

- **Contraseña por Defecto:** `GiftExchange2025!` (cambiar en producción)
- **Fechas Importantes:**
  - Registro: 4-14 de Diciembre
  - Sorteo: 15 de Diciembre
  - Revelación: 24 de Diciembre
- **Límite de Regalos:** Mínimo 5 opciones por participante
- **Categorías:** Elite ($1,000) y Diversión ($500)

## 🎨 Personalización

Para cambiar los colores del tema, edita `.streamlit/config.toml`:

```toml
[theme]
primaryColor = "#dc2626"        # Color principal (rojo navideño)
backgroundColor = "#ffffff"      # Fondo blanco
secondaryBackgroundColor = "#f0f9ff"  # Fondo secundario
textColor = "#1f2937"           # Color del texto
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Emmanuel - [@EGarpxMaster](https://github.com/EGarpxMaster)

## 🎄 ¡Felices Fiestas!

¿Preguntas o problemas? Abre un issue en GitHub.

---

**Hecho con ❤️ y Streamlit para hacer el intercambio de regalos más mágico** 🎁✨
