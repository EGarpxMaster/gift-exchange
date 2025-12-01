# 🎄 Intercambio de Regalos 2025 - El Sistema de Emmanuel

Aplicación web para gestionar el intercambio de regalos de fin de año con encriptación de nombres y sorteo automático.

## 🎁 Características Principales

- **Animación de Sobre Interactivo:** Experiencia visual única con Anime.js para revelar el amigo secreto
- **Encriptación de Nombres:** Los nombres de los participantes se encriptan para mantener el secreto
- **Sorteo Automático:** Algoritmo que garantiza que nadie se toque a sí mismo y no haya intercambios equivalentes
- **Gestión por Categorías:** Élite ($1,000 MXN) y Diversión ($500 MXN)
- **Panel de Administrador:** Control total del sorteo, encriptación y revelación de nombres
- **Validación de Fechas:** Registro solo del 5 al 15 de diciembre, revelación el 24 de diciembre
- **Interfaz Navideña:** Tema festivo con efecto de nieve y colores de temporada

## 🚀 Configuración Inicial

### 1. Base de Datos (Supabase)

1. Crea un nuevo proyecto en [Supabase](https://supabase.com/)
2. Ve al **SQL Editor** y ejecuta el script completo que se encuentra en `supabase/schema.sql`
3. Verifica que se crearon las tablas:
   - `participants` (con nombres encriptados)
   - `settings` (configuración global)
4. Obtén tus credenciales en **Project Settings > API**:
   - `Project URL`
   - `anon public` key

### 2. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

### 3. Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 🌐 Despliegue en GitHub Pages

### Configuración Automática

Este proyecto está configurado para desplegarse automáticamente en GitHub Pages:

1. **Habilita GitHub Pages:**
   - Ve a Settings > Pages en tu repositorio
   - En "Source", selecciona "GitHub Actions"

2. **Configura las variables de entorno:**
   - Ve a Settings > Secrets and variables > Actions
   - Agrega los secrets:
     - `VITE_SUPABASE_URL`: Tu URL de Supabase
     - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima de Supabase

3. **Push a main:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

4. El workflow de GitHub Actions se ejecutará automáticamente y desplegará tu aplicación

5. Tu aplicación estará disponible en: `https://<usuario>.github.io/gift-exchange/`

### Despliegue Manual

Si prefieres desplegar manualmente:

```bash
# Instalar gh-pages
npm install -D gh-pages

# Construir y desplegar
npm run deploy
```

## 📋 Flujo de Uso

### Para Participantes

1. **Registro (5-15 Diciembre):**
   - Ingresar nombre completo (se encriptará automáticamente)
   - Seleccionar categoría (Élite o Diversión)
   - Agregar mínimo 5 opciones de regalo
   - El sistema valida que no haya duplicados

2. **Post-Sorteo (16-23 Diciembre):**
   - **Ver el Sobre Animado:** Hacer clic en el sobre rojo para activar la animación
   - La animación muestra:
     - Apertura del sobre con rotación 3D
     - Tarjeta que sale del sobre
     - Zoom y revelación del contenido
   - Ver las opciones de regalo de su amigo secreto
   - **NO** se muestra el nombre (permanece encriptado)

3. **Revelación (24 Diciembre):**
   - El sistema revela automáticamente el nombre del amigo secreto
   - Se muestran todas las opciones de regalo

### Para Administrador (Emmanuel)

Accede al panel administrativo agregando `?admin=true` a la URL.

1. **Ver Estadísticas:**
   - Total de participantes
   - Participantes por categoría
   - Estado del sorteo

2. **Ejecutar Sorteo:**
   - Solo se puede ejecutar una vez
   - El algoritmo garantiza:
     - Nadie se toca a sí mismo
     - No hay intercambios equivalentes (si A→B, entonces B→A no es posible)
     - Sorteo separado por categoría

3. **Gestionar Encriptación:**
   - **Cambiar Contraseña:** Permite actualizar la contraseña de encriptación
   - **Ver Nombres:** Desencriptar nombres temporalmente (requiere contraseña)
   - **IMPORTANTE:** Guarda la nueva contraseña, se necesita para desencriptar

4. **Revelar Nombres:**
   - Fuerza la revelación de nombres antes del 24 de diciembre (si es necesario)

## 🔐 Seguridad y Encriptación

- Los nombres se encriptan usando **AES-GCM** (256 bits)
- La contraseña por defecto es `GiftExchange2025!` (cámbiala en el panel de admin)
- Solo quien tenga la contraseña puede desencriptar los nombres
- La contraseña se almacena como hash SHA-256 en la base de datos

## 🧪 Modo de Desarrollo

La aplicación incluye controles de simulación para pruebas:

- **Botón "Simular 10 Dic":** Simula que estamos dentro del periodo de registro
- **Botón "Simular 25 Dic":** Simula la fecha de revelación de nombres

Estos botones solo están visibles en desarrollo para facilitar las pruebas.

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── AdminPanel.tsx      # Panel de administración
│   ├── ChristmasLetter.tsx # Carta de bienvenida
│   ├── Dashboard.tsx       # Vista del participante
│   ├── EnvelopeReveal.tsx  # Animación del sobre (Anime.js)
│   ├── Layout.tsx          # Layout principal con nieve
│   ├── RegisterForm.tsx    # Formulario de registro
│   └── SnowEffect.tsx      # Efecto de partículas de nieve
├── lib/
│   ├── encryption.ts       # Utilidades de encriptación
│   ├── sorteo.ts          # Algoritmo de sorteo
│   └── supabase.ts        # Cliente y helpers de Supabase
├── App.tsx                # Componente principal
└── index.css              # Estilos globales

supabase/
└── schema.sql             # Esquema de la base de datos
```

## 🎨 Personalización

### Cambiar Fechas

Edita las constantes en los componentes:
- `RegisterForm.tsx`: Fechas de inicio y fin del registro
- `Dashboard.tsx`: Fecha de revelación

### Cambiar Contraseña de Encriptación

1. Ve al panel de administrador (`?admin=true`)
2. Haz clic en "Cambiar Contraseña de Encriptación"
3. Ingresa la contraseña actual (por defecto: `GiftExchange2025!`)
4. Ingresa y confirma la nueva contraseña
5. **GUARDA LA NUEVA CONTRASEÑA** - la necesitarás para desencriptar

## ⚠️ Notas Importantes

- **No pierdas la contraseña de encriptación** - no hay forma de recuperar los nombres sin ella
- El sorteo solo se puede ejecutar una vez (marcado como completado en la BD)
- Mínimo 2 participantes por categoría para poder hacer el sorteo
- Los participantes con solo 1 persona en su categoría no podrán ser asignados

## 🎅 Créditos

Sistema desarrollado por Emmanuel para el Intercambio de Regalos de Fin de Año 2025.

**¡Felices Fiestas y Próspero Año Nuevo 2026!** 🎉🎁
