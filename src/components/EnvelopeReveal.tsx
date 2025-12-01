import { useRef, useState } from 'react';
import { Timeline } from 'animejs';
import { Gift } from 'lucide-react';

interface EnvelopeRevealProps {
  recipientName?: string; // Nombre del amigo secreto (si está revelado)
  giftOptions: string[]; // Lista de regalos
  isNameRevealed: boolean; // Si ya se debe mostrar el nombre
  onRevealComplete?: () => void; // Callback cuando termine la animación
}

export function EnvelopeReveal({ 
  recipientName, 
  giftOptions, 
  isNameRevealed,
  onRevealComplete 
}: EnvelopeRevealProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (isAnimating || showCard) return;
    if (!sealRef.current || !flapRef.current || !cardRef.current || !contentRef.current || !envelopeRef.current) return;
    
    setIsAnimating(true);

    // Timeline de animación con Anime.js
    const tl = new Timeline({
      duration: 800,
    });

    // 1. Animar el sello desapareciendo
    tl.add(sealRef.current, {
      scale: [1, 0],
      opacity: [1, 0],
      duration: 300,
      ease: 'in-back',
    });

    // 2. La solapa superior gira 180° hacia arriba (rotateX)
    tl.add(flapRef.current, {
      rotateX: [0, -180],
      duration: 900,
      ease: 'inOut-quad',
    }, '-=100');

    // 3. La tarjeta se desliza hacia arriba saliendo del sobre (translateY)
    tl.add(cardRef.current, {
      translateY: [0, -100],
      opacity: [0, 1],
      duration: 800,
      ease: 'out-quad',
      onBegin: () => {
        if (cardRef.current) {
          cardRef.current.style.display = 'block';
        }
      }
    }, '-=400');

    // 4. La tarjeta hace zoom y se centra en la pantalla (scale)
    tl.add(cardRef.current, {
      scale: [0.8, 1.2],
      translateY: [-100, -150],
      duration: 600,
      ease: 'out-back',
    });

    // 5. El sobre desaparece
    tl.add(envelopeRef.current, {
      opacity: [1, 0],
      duration: 400,
      ease: 'out-quad',
    }, '-=300');

    // 6. La tarjeta se ajusta al tamaño final
    tl.add(cardRef.current, {
      scale: [1.2, 1],
      translateY: [-150, 0],
      translateX: [0, 0],
      duration: 500,
      ease: 'out-quad',
    });

    // 7. Aparece el contenido de la tarjeta suavemente (opacity)
    tl.add(contentRef.current, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      ease: 'out-quad',
      onComplete: () => {
        setShowCard(true);
        setIsAnimating(false);
        if (onRevealComplete) {
          onRevealComplete();
        }
      }
    }, '-=400');
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center perspective-1000">
      {/* El Sobre */}
      <div 
        ref={envelopeRef}
        className="relative cursor-pointer transform-style-3d"
        onClick={handleClick}
      >
        {/* Cuerpo principal del sobre - Rectángulo rojo */}
        <div className="relative w-80 h-56 bg-red-600 rounded-sm shadow-2xl overflow-visible">
          
          {/* Parte interior del sobre (sombra) */}
          <div className="absolute inset-0 bg-linear-to-b from-red-700 to-red-600"></div>

          {/* Solapa inferior (triángulos usando borders) */}
          <div className="absolute bottom-0 left-0 w-full h-0 border-l-160 border-l-transparent border-r-160 border-r-transparent border-b-80 border-b-red-700 opacity-90"></div>

          {/* Solapa superior (la que se abre) */}
          <div 
            ref={flapRef}
            className="absolute top-0 left-0 w-full origin-top transform-style-3d"
            style={{ transformOrigin: 'top center' }}
          >
            {/* Triángulo de la solapa usando borders */}
            <div className="absolute top-0 left-0 w-0 h-0 border-l-160 border-l-red-500 border-r-160 border-r-red-500 border-t-100 border-t-red-600 shadow-lg"></div>
            
            {/* Borde decorativo de la solapa */}
            <div className="absolute top-0 left-0 w-full h-0 border-l-160 border-l-transparent border-r-160 border-r-transparent border-t-100 border-t-red-700 opacity-20"></div>
          </div>

          {/* Sello dorado (icono de regalo) */}
          <div 
            ref={sealRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-linear-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl border-4 border-yellow-200 z-10"
          >
            <Gift className="w-10 h-10 text-red-700" strokeWidth={2.5} />
          </div>

          {/* Detalles decorativos del sobre */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-6 right-8 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* La Tarjeta que sale del sobre */}
        <div 
          ref={cardRef}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 bg-white rounded-lg shadow-2xl p-8 hidden"
          style={{ transformOrigin: 'center center' }}
        >
          <div ref={contentRef} className="opacity-0 space-y-6">
            {/* Encabezado de la tarjeta */}
            <div className="text-center border-b-2 border-red-200 pb-4">
              {isNameRevealed && recipientName ? (
                <div className="space-y-2">
                  <h2 className="text-2xl font-display text-red-600">🎉 ¡Tu Amigo Secreto es!</h2>
                  <h3 className="text-4xl font-bold text-red-700 animate-bounce">{recipientName}</h3>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-2xl font-display text-red-600">🎁 Tu Amigo Secreto desea...</h2>
                  <p className="text-sm text-gray-500 italic">El nombre se revelará el 24 de diciembre</p>
                </div>
              )}
            </div>

            {/* Lista de regalos */}
            <div className="bg-linear-to-br from-red-50 to-green-50 p-6 rounded-lg">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-red-600" />
                Lista de Deseos:
              </h4>
              <ul className="space-y-3">
                {giftOptions.map((option, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-3 text-gray-700 bg-white p-3 rounded shadow-sm"
                  >
                    <span className="shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="flex-1">{option}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decoración navideña */}
            <div className="text-center text-4xl space-x-2 pt-4 border-t-2 border-green-200">
              <span>🎄</span>
              <span>⭐</span>
              <span>🎅</span>
              <span>❄️</span>
              <span>🎁</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicación de click */}
      {!showCard && !isAnimating && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-center animate-bounce">
          <p className="text-lg font-semibold drop-shadow-lg">Haz clic en el sobre para abrirlo</p>
          <p className="text-sm opacity-75">👆</p>
        </div>
      )}
    </div>
  );
}
