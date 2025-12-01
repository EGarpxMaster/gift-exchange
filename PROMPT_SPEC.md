# Prompt para Generar la Aplicación de Intercambio de Regalos

**Rol:** Desarrollador Senior Fullstack experto en React, TypeScript, Tailwind CSS, Animaciones Web y Supabase.

**Objetivo:** Crear una aplicación web para gestionar un intercambio de regalos de fin de año. La prioridad visual es replicar una animación de apertura de sobre idéntica a la referencia en video.

---

## Stack Tecnológico

*   **Frontend:** React + Vite + TypeScript
*   **Animaciones:** Anime.js (**Obligatorio** para la secuencia de apertura del sobre)
*   **Estilos:** Tailwind CSS (Uso avanzado de CSS borders para dibujar geometría)
*   **Backend/Base de Datos:** Supabase (Auth, Database)
*   **Gestión de Estado:** A tu elección (Context API o Zustand recomendado)

---

## Requerimientos Funcionales

### 1. Registro de Participantes

*   **Periodo de Inscripción:** La aplicación debe permitir registros únicamente del **5 al 15 de diciembre de 2025**. Fuera de este rango, debe mostrar un mensaje indicando que el registro está cerrado.
*   **Datos del Formulario:**
    *   **Nombre Completo:** (este nombre quedará encriptado en la base de datos)
    *   **Categoría:** Selección única entre:
        *   *Categoría Élite ($1,000 MXN)* - Sugerido para adultos
        *   *Categoría Diversión ($500 MXN)* - Sugerido para niños
    *   **Opciones de Regalo:** Campo para ingresar mínimo 5 ideas de regalo obligatorias.
*   **Validación:** No permitir registros duplicados por nombre.

### 2. Mecánica del Intercambio (El Secreto)

*   **Sorteo Automático:**
    *   El sistema debe realizar automáticamente la asignación cuando termine el periodo de inscripción (después del 15 de diciembre).
    *   El sorteo se hace por separado para cada categoría (Élite y Diversión).
*   **Restricciones obligatorias:**
    *   No puede haber intercambios equivalentes (si A le toca B, B no puede tocarle A).
    *   Nadie puede tocarse a sí mismo.
    *   El algoritmo debe garantizar que todos tengan asignación válida.
*   **Privacidad y Encriptación:**
    *   Los nombres de los participantes deben estar encriptados en la base de datos.
    *   **Después del sorteo pero antes del 24 de diciembre:** Los participantes pueden ver las opciones de regalo de la persona a quien le tocó regalar, pero **NO** ven el nombre (nombre sigue encriptado).
    *   **El 24 de diciembre (día del intercambio):** El sistema revela los nombres desencriptados.

### 3. Panel de Administrador

*   **Funcionalidades requeridas:**
    *   Ver todos los participantes inscritos (con nombres encriptados).
    *   Visualizar el estado del sorteo.
    *   **Gestión de contraseña de encriptación:** Poder cambiar la contraseña de encriptación para que el administrador (Emmanuel) no tenga acceso directo a los nombres reales.
    *   Forzar revelación de nombres (en caso necesario).
    *   Ver estadísticas: total por categoría, estado de asignaciones.

### 4. Dashboard de Participantes (Réplica de Animación de Video)

*   **Estado Inicial (El Sobre):**
    *   Mostrar un sobre rojo cerrado centrado en pantalla con un sello dorado (icono de regalo o copo de nieve).
    *   El sobre debe estar construido con HTML y CSS/Tailwind (usando bordes para crear los triángulos de las solapas), **no una imagen estática**, para permitir la animación de las partes individuales.
*   **Secuencia de Animación (Anime.js):**
    *   Al hacer clic en el sello/sobre, debe ejecutarse la siguiente línea de tiempo (timeline):
        1.  La solapa superior gira 180° hacia arriba (`rotateX`) abriendo el sobre.
        2.  Una tarjeta blanca se desliza hacia arriba saliendo del interior del sobre (`translateY`).
        3.  La tarjeta hace un zoom (`scale`) y se centra en la pantalla cubriendo el sobre.
        4.  Aparece el contenido de la tarjeta suavemente (`opacity`).
*   **Contenido de la Tarjeta:**
    *   **Antes del 24 de Dic:** Muestra "Tu amigo secreto desea..." seguido de la lista de regalos. El nombre permanece oculto.
    *   **El 24 de Dic:** Muestra "¡Tu amigo secreto es [NOMBRE]!" con una animación festiva y la lista de regalos.

### 5. Interfaz de Usuario (UI/UX)

*   **Tema:** Navideño, Año Nuevo 2026.
*   **Fondo:** Color sólido festivo (ej. Rojo o Azul Noche) con efecto de partículas de nieve cayendo (usando CSS o Canvas ligero).
*   **Textos:** Utilizar el tono y la información de la invitación proporcionada.
*   **Home:** Bienvenida con información de fechas importantes:
    *   Registro: 5-15 de diciembre
    *   Sorteo automático: 15 de diciembre
    *   Revelación de nombres: 24 de diciembre

---

## Estructura de Base de Datos (Supabase)

### Tabla: `participants`

```sql
- id (uuid, primary key)
- encrypted_name (text) -- Nombre encriptado
- category (text) -- 'elite' o 'diversión'
- gift_options (text[] o jsonb) -- Array con las 5 opciones de regalo
- assigned_to_id (uuid, foreign key a participants.id) -- A quién le tocó regalar
- created_at (timestamp)
```

### Tabla: `settings`

```sql
- id (uuid, primary key)
- encryption_password_hash (text) -- Hash de la contraseña de encriptación
- names_revealed (boolean) -- Flag para revelar nombres el 24 de diciembre
- sorteo_completed (boolean) -- Flag para indicar si ya se hizo el sorteo
- updated_at (timestamp)
```

---

## Fechas Clave del Sistema

*   **5 de diciembre de 2025:** Inicio del periodo de inscripción.
*   **15 de diciembre de 2025:** Fin del periodo de inscripción y sorteo automático.
*   **16-23 de diciembre de 2025:** Participantes pueden ver opciones de regalo (sin nombres) mediante la animación del sobre.
*   **24 de diciembre de 2025:** Revelación de nombres (día del intercambio).

---

## Información de la Invitación (Contexto)

> 🎉 **¡Únete a Nuestro Intercambio de Regalos de Fin de Año 2025!** 🎁
>
> ¡Queremos dar la bienvenida al Año Nuevo 2026 de una manera muy especial y llena de sorpresas!
>
> Están cordialmente invitados a participar en nuestro tradicional Intercambio de Regalos el próximo **24 de diciembre de 2025**.
>
> **🌟 Secciones de Intercambio:**
>
> *   **Categoría Élite - $1,000 MXN:**
>     *   Monto Sugerido: $1,000 pesos mexicanos
>     *   Participantes: Especialmente diseñada para Adultos
> *   **Categoría Diversión - $500 MXN:**
>     *   Monto Sugerido: $500 pesos mexicanos
>     *   Participantes: Dedicada a los Niños
>
> *Nota para Adultos: Si por alguna razón la participación en la categoría de $1,000 pesos no es posible, ¡no se preocupen! Simplemente comuníquenoslo y con gusto los asignaremos a la categoría de $500 pesos, ¡lo importante es que todos participen!*
>
> **💻 El Secreto Mejor Guardado: El Sistema de Emmanuel**
>
> ¡Hemos creado un método infalible para garantizar que la sorpresa sea total!
>
> 1.  **Paso 1:** Emmanuel está creando un programa especial.
> 2.  **Paso 2:** Cada participante deberá anexar una lista de 5 o más ideas de regalo que le gustaría recibir.
> 3.  **Paso 3:** El programa hará la "rifa" en secreto, y solo les dirá qué quiere la persona que les tocó regalar.
>
> De esta manera, nadie sabrá quién le regala, asegurando que la revelación del 24 de diciembre sea una maravillosa sorpresa para todos.
>
> **📅 ¡Confirma tu Participación antes del 5 de diciembre!**

---

## Entregables

1.  Código fuente completo estructurado (Vite + React).
2.  Componente reutilizable `EnvelopeReveal` implementado con **Anime.js**.
3.  Script SQL para configurar Supabase.
4.  Archivo `README.md` con documentación de instalación y uso.
5.  Algoritmo de sorteo que respete las restricciones y lógica de encriptación.

**Instrucción Adicional:** No crees archivos innecesarios. Mantén la estructura básica y limpia. Utiliza CSS puro y Tailwind para la geometría del sobre (no imágenes) para garantizar la fluidez de la animación.
