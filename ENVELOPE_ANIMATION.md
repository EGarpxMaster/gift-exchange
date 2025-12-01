# 📧 Componente EnvelopeReveal - Documentación de Animación

## 🎯 Descripción

El componente `EnvelopeReveal` es el corazón visual de la aplicación. Implementa una animación fluida de apertura de sobre usando **Anime.js v4** con geometría CSS pura (sin imágenes).

## 🏗️ Estructura del Sobre

El sobre está construido completamente con HTML y CSS/Tailwind usando la técnica de **CSS borders** para crear triángulos:

### Elementos Principales

```
┌─────────────────────────────┐
│    Solapa Superior (▼)      │  ← Triángulo usando borders
├─────────────────────────────┤
│                             │
│    Cuerpo del Sobre         │  ← Rectángulo rojo (bg-red-600)
│                             │
│    ┌───────────────────┐    │
│    │   Sello Dorado    │    │  ← Círculo con icono de regalo
│    └───────────────────┘    │
│                             │
└─────────────────────────────┘
       Solapa Inferior (▲)        ← Triángulo usando borders
```

### Técnica de Triángulos CSS

Los triángulos se crean usando el truco de los borders:

```css
/* Solapa superior - triángulo hacia abajo */
border-l-160 border-l-red-500      /* Borde izquierdo rojo */
border-r-160 border-r-red-500      /* Borde derecho rojo */
border-t-100 border-t-red-600      /* Borde superior (forma el triángulo) */

/* Solapa inferior - triángulo hacia arriba */
border-l-160 border-l-transparent  /* Borde izquierdo transparente */
border-r-160 border-r-transparent  /* Borde derecho transparente */
border-b-80 border-b-red-700       /* Borde inferior (forma el triángulo) */
```

## 🎬 Secuencia de Animación (Timeline)

La animación usa un **Timeline** de Anime.js con 7 pasos encadenados:

### 1. Desaparición del Sello (300ms)
```typescript
tl.add(sealRef.current, {
  scale: [1, 0],
  opacity: [1, 0],
  duration: 300,
  ease: 'in-back',
});
```
- El sello dorado se encoge y desaparece
- Easing `in-back`: efecto de "retroceso" antes de desaparecer

### 2. Apertura de la Solapa (900ms)
```typescript
tl.add(flapRef.current, {
  rotateX: [0, -180],  // Rotación 3D en eje X
  duration: 900,
  ease: 'inOut-quad',
}, '-=100');  // Comienza 100ms antes de que termine la animación anterior
```
- La solapa superior rota 180° hacia arriba
- Usa `rotateX` para efecto 3D
- `-=100`: overlap para transición fluida

### 3. Deslizamiento de la Tarjeta (800ms)
```typescript
tl.add(cardRef.current, {
  translateY: [0, -100],  // Mueve hacia arriba
  opacity: [0, 1],        // Aparece gradualmente
  duration: 800,
  ease: 'out-quad',
  onBegin: () => {
    cardRef.current.style.display = 'block';
  }
}, '-=400');
```
- La tarjeta blanca sale del sobre
- Comienza invisible y se desliza hacia arriba
- Se hace visible al iniciar

### 4. Zoom de la Tarjeta (600ms)
```typescript
tl.add(cardRef.current, {
  scale: [0.8, 1.2],      // Agranda la tarjeta
  translateY: [-100, -150], // Continúa subiendo
  duration: 600,
  ease: 'out-back',
});
```
- La tarjeta crece y se acerca al usuario
- `out-back`: efecto de "rebote" al final

### 5. Desaparición del Sobre (400ms)
```typescript
tl.add(envelopeRef.current, {
  opacity: [1, 0],
  duration: 400,
  ease: 'out-quad',
}, '-=300');
```
- El sobre se desvanece mientras la tarjeta crece
- Overlap de 300ms para transición suave

### 6. Ajuste Final de la Tarjeta (500ms)
```typescript
tl.add(cardRef.current, {
  scale: [1.2, 1],        // Vuelve al tamaño normal
  translateY: [-150, 0],  // Se centra en pantalla
  translateX: [0, 0],
  duration: 500,
  ease: 'out-quad',
});
```
- La tarjeta vuelve a su tamaño natural
- Se posiciona en el centro de la pantalla

### 7. Aparición del Contenido (800ms)
```typescript
tl.add(contentRef.current, {
  opacity: [0, 1],
  translateY: [20, 0],
  duration: 800,
  ease: 'out-quad',
  onComplete: () => {
    setShowCard(true);
    setIsAnimating(false);
    onRevealComplete?.();
  }
}, '-=400');
```
- El texto y lista de regalos aparecen gradualmente
- Callback `onComplete` ejecuta confetti y actualiza el estado

## 🎨 Perspectiva 3D

Para que las rotaciones 3D funcionen correctamente:

### En el CSS Global (`index.css`):
```css
.transform-style-3d {
  transform-style: preserve-3d;
}

.perspective-1000 {
  perspective: 1000px;
}
```

### En el Componente:
```tsx
<div className="perspective-1000">  {/* Contenedor con perspectiva */}
  <div className="transform-style-3d"> {/* Sobre con 3D preservado */}
    <div ref={flapRef} style={{ transformOrigin: 'top center' }}>
      {/* Solapa que rota desde el borde superior */}
    </div>
  </div>
</div>
```

## 📊 Props del Componente

```typescript
interface EnvelopeRevealProps {
  recipientName?: string;    // Nombre del amigo secreto (opcional si no revelado)
  giftOptions: string[];     // Array con las opciones de regalo
  isNameRevealed: boolean;   // true = muestra nombre, false = oculta
  onRevealComplete?: () => void; // Callback al terminar animación (ej: confetti)
}
```

## 🎯 Contenido Condicional

La tarjeta muestra contenido diferente según si el nombre está revelado:

### ANTES del 24 de Diciembre (`isNameRevealed = false`):
```tsx
<h2>🎁 Tu Amigo Secreto desea...</h2>
<p>El nombre se revelará el 24 de diciembre</p>
<ul>{/* Lista de regalos */}</ul>
```

### EL 24 de Diciembre (`isNameRevealed = true`):
```tsx
<h2>🎉 ¡Tu Amigo Secreto es!</h2>
<h3 className="animate-bounce">{recipientName}</h3>
<ul>{/* Lista de regalos */}</ul>
```

## 🔧 Uso en Dashboard

```tsx
import { EnvelopeReveal } from './EnvelopeReveal';

<EnvelopeReveal
  recipientName={decryptedMatchName}
  giftOptions={matchData.gift_options}
  isNameRevealed={shouldRevealName}
  onRevealComplete={handleReveal}  // Ejecuta confetti
/>
```

## ⚡ Optimizaciones

1. **Validación de Refs**: Se valida que todos los refs existan antes de animar
2. **Estado de Bloqueo**: `isAnimating` previene clicks múltiples
3. **Display Inicial**: La tarjeta está `display: none` hasta que inicia la animación
4. **Overlapping**: Uso de `-=` para que las animaciones se solapen y sean más fluidas

## 🎨 Clases de Tailwind v4

El componente usa la nueva sintaxis de Tailwind 4:

```tsx
// Gradientes
bg-linear-to-b    // antes: bg-gradient-to-b
bg-linear-to-br   // antes: bg-gradient-to-br

// Borders customizados
border-l-160      // antes: border-l-[160px]
border-t-100      // antes: border-t-[100px]

// Flex
shrink-0          // antes: flex-shrink-0
```

## 🎭 Indicador Visual

Mensaje animado que invita al usuario a interactuar:

```tsx
{!showCard && !isAnimating && (
  <div className="animate-bounce">
    <p>Haz clic en el sobre para abrirlo</p>
    <p>👆</p>
  </div>
)}
```

## 🎬 Duración Total

```
Paso 1: 300ms
Paso 2: 900ms  (overlap -100ms) = +800ms
Paso 3: 800ms  (overlap -400ms) = +400ms
Paso 4: 600ms
Paso 5: 400ms  (overlap -300ms) = +100ms
Paso 6: 500ms
Paso 7: 800ms  (overlap -400ms) = +400ms
──────────────────────────────────────
TOTAL: ~3100ms (3.1 segundos)
```

## 🎯 Tips de Personalización

### Cambiar Velocidad Global:
```typescript
const tl = new Timeline({
  duration: 600,  // Más rápido (default: 800)
});
```

### Cambiar Colores del Sobre:
```tsx
className="bg-red-600"     → bg-blue-600
className="border-t-red-600" → border-t-green-600
```

### Cambiar Easing:
- `in-back`: Retroceso antes de iniciar
- `out-back`: Rebote al final
- `inOut-quad`: Aceleración y desaceleración suave
- `out-expo`: Desaceleración exponencial
- `linear`: Velocidad constante

---

**Desarrollado con ❤️ usando Anime.js v4 + React + TypeScript + Tailwind CSS**
