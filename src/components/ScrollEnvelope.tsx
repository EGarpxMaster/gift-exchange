import { useEffect, useRef, useState } from 'react';
import * as anime from 'animejs';

interface ScrollEnvelopeProps {
  recipientName?: string;
  giftOptions: string[];
  isNameRevealed: boolean;
  onRevealComplete: () => void;
}

export function ScrollEnvelope({ 
  recipientName, 
  giftOptions, 
  isNameRevealed,
  onRevealComplete 
}: ScrollEnvelopeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topFoldRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  
  const [scrollProgress, setScrollProgress] = useState(0);

  // Tracking del scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calcular progreso: empieza cuando el elemento entra en la vista
      const scrollStart = windowHeight;
      const scrollRange = windowHeight * 2;
      const currentScroll = scrollStart - rect.top;
      
      const progress = Math.max(0, Math.min(1, currentScroll / scrollRange));
      setScrollProgress(progress);

      if (progress > 0.8 && isNameRevealed) {
        onRevealComplete();
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isNameRevealed, onRevealComplete]);

  // Aplicar animaciones con Anime.js basadas en scrollProgress
  useEffect(() => {
    if (!topFoldRef.current || !letterRef.current) return;

    // Calcular altura base de la carta (equivalente a --letter-height)
    const baseHeight = typeof window !== 'undefined' && window.innerWidth >= 768 ? 318 : 143; // envelope-height - 2rem
    const maxHeight = typeof window !== 'undefined' && window.innerWidth >= 768 ? 612.5 : 306.25; // envelope-height * 1.75

    // SECUENCIA CORRECTA (siguiendo código de referencia):
    // 1. Solapa se abre (0-33% del scroll) - equivalente a delay 500ms en hover
    // 2. Carta crece (33-100% del scroll) - equivalente a delay 1250ms en hover
    // 3. El sobre NO SE MUEVE (rotateY eliminado, se queda mostrando el frente)

    // Fase 1: Abrir solapa (0-33%)
    const foldProgress = Math.min(scrollProgress / 0.33, 1);
    (anime as any)({
      targets: topFoldRef.current,
      rotateX: foldProgress * 180,
      duration: 0,
      easing: 'easeOutCubic'
    });

    // Fase 2: Expandir carta (33-100%)
    const letterProgress = Math.max(0, Math.min((scrollProgress - 0.33) / 0.67, 1));
    (anime as any)({
      targets: letterRef.current,
      height: baseHeight + (letterProgress * (maxHeight - baseHeight)),
      duration: 0,
      easing: 'easeOutCubic'
    });
  }, [scrollProgress]);

  return (
    <div ref={containerRef} className="min-h-[200vh] flex items-start justify-center pt-20 px-4">
      <style>{`
        .envelope {
          --envelope-width: 300px;
          --envelope-height: 175px;
          --letter-base-height: 143px;
        }
        
        @media (min-width: 768px) {
          .envelope {
            --envelope-width: 600px;
            --envelope-height: 350px;
            --letter-base-height: 318px;
          }
        }
      `}</style>

      <div 
        className="envelope sticky top-20"
        style={{
          width: 'var(--envelope-width)',
          height: 'var(--envelope-height)',
          perspective: '1000px',
          position: 'relative'
        }}
      >
        {/* Envelope Inner - NO SE MUEVE (como en el código de referencia) */}
        <div
          className="envelope-inner"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            display: 'grid',
            gridArea: '1/1'
          }}
        >
          {/* Parte FRONTAL del sobre */}
          <div
            className="envelope-front"
            style={{
              gridArea: '1/1',
              width: '100%',
              height: '100%',
              backgroundColor: '#d14d44',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              isolation: 'isolate',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {/* Estampilla */}
            <div 
              className="absolute top-4 right-2"
              style={{ width: '15%' }}
            >
              <svg fill="currentColor" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                <path d="M253.98,257.652c0-8.568,8.568-17.748,17.136-18.361c-1.224-4.895-1.224-10.402-0.611-15.299 c-3.061,0.611-7.345,0-10.404-1.225c-6.12-3.061-9.792-9.18-9.792-15.912c0-9.18,7.956-20.807,17.136-21.42 c0-2.447,0.612-4.896,0.612-7.344s0.612-4.896,0.612-7.344c-7.956,3.061-17.137-4.283-18.973-12.24 c-1.836-9.792,4.284-17.748,12.853-21.42c-0.612-1.836-0.612-4.284-0.612-6.12c0-3.672,0-7.344,0.612-11.016 c-3.061,0-6.12-1.224-9.181-3.06c-4.283-3.06-6.731-7.344-7.344-12.24c0-0.612,0-1.836,0-2.448c0-9.792,8.568-15.3,17.136-16.524 c-0.611-3.672,0-7.956,0-11.628c0-3.06,0-6.12,0.612-9.18c-7.956,2.448-18.36-4.284-20.808-12.24 c-2.448-7.956,1.836-17.748,9.792-20.808c-1.225-3.06-1.225-6.732-1.225-10.404c0-3.06-0.611-6.732-0.611-9.792 c-9.792,12.24-39.168,4.284-40.393-9.18C205.632,3.672,200.124,1.836,195.84,0c0.611,9.18-7.956,17.748-17.137,17.748 c-9.18,0-16.523-6.732-18.359-15.3c-2.448,0-4.896,0-6.732-0.612c-2.448,0-4.896-0.612-7.956-1.224c0,4.284-2.448,9.18-5.508,12.24 c-3.672,3.672-9.18,6.12-14.076,6.12c-1.224,0-2.448,0-3.672-0.612c-5.508-1.224-12.24-4.896-14.076-11.016 c0-0.612,0-0.612,0-1.224c-4.896,0.612-11.016-0.612-15.912-2.448c-0.612,8.568-9.18,15.3-18.36,14.076 c-4.284-0.612-9.792-3.06-11.016-7.344c0-0.612,0-0.612,0-1.224c0,0,0,0.612-0.612,0.612c-3.672,3.06-8.568,2.448-12.852,1.836 c-1.224,0-2.448,0-3.672,0c1.224,0.612,1.836,1.836,2.448,2.448c3.672,4.896,5.508,11.016,3.06,17.136 c-3.06,8.568-14.076,12.24-22.032,9.18c0,1.224-0.612,1.836-0.612,3.06c-0.612,3.672-0.612,6.732-0.612,10.404 c9.792-1.224,22.644,1.224,23.868,12.852c0.612,5.508-3.06,11.016-8.568,12.852c-2.448,1.224-5.508,1.224-7.956,1.224 c-0.612,0-1.224,0-2.448-0.612c0,1.836,0,4.284,0,6.12c0,3.672,0.612,7.344-0.612,11.016l0,0c0.612,0,0.612-0.612,1.224-0.612 c11.628-3.672,23.256,7.344,19.584,18.972c-1.224,4.896-5.508,8.568-9.792,10.404c-3.672,1.224-6.732,1.836-10.404,1.836 c-0.612,1.836-0.612,3.06-1.224,4.896c-0.612,2.448-0.612,5.508-0.612,7.956c8.568-4.284,22.032-1.836,22.644,9.18 c0.612,9.179-10.404,24.48-21.42,23.869c0,1.223,0,3.059,0,4.283c0,2.447-0.612,4.896-0.612,7.957 c2.448-1.225,6.12-1.836,9.18-1.836c6.12,0.611,11.016,4.895,12.24,11.016c3.672,13.463-9.18,22.643-20.808,20.807 c-0.612,4.285-1.224,9.793-1.836,13.465c5.508-4.283,17.748-3.061,21.42,4.283c8.568,15.912-8.568,25.705-22.032,28.152 c0,4.896,0,10.404-1.224,15.301c7.344-4.285,18.36-4.285,25.704,0c7.956,4.896,11.628,13.463,11.628,22.031 c3.672-0.611,7.344-1.223,11.016-1.223c0-8.568,9.18-20.197,16.524-20.809c4.896-0.613,9.792,2.447,11.628,7.344 c1.836,4.283,1.224,9.791,3.06,14.076c0.612,0,1.224-0.611,1.836-0.611c3.06,0,4.896-0.613,7.344-1.838 c-0.612-1.836,0-3.672,0.612-6.119c1.224-4.896,5.508-9.18,10.404-10.404c11.016-3.061,19.584,4.896,22.645,14.688 c3.672-0.611,7.344-0.611,11.628-0.611c1.836,0,3.672,0,5.508,0.611c-2.448-8.566,4.284-18.971,13.464-19.584 c0.612,0,1.224,0,1.836,0c5.508,0,10.404,3.061,13.464,6.732c1.836,2.449,3.672,5.508,4.284,8.568c1.224,0,2.448,0,4.284,0 s3.672,0,5.508,0c1.224-7.955,9.792-14.076,17.748-14.688c7.956-0.613,15.912,3.672,19.584,11.016 c5.508-3.672,13.464-6.119,20.808-6.119c0-2.449,0-4.896,0-7.957C261.936,273.564,253.98,264.996,253.98,257.652z"/>
              </svg>
            </div>

            {/* Dirección */}
            <div className="text-left px-4 text-sm md:text-xl">
              <p className="mb-1">
                <span className="font-light">Para:</span>{' '}
                <span className="font-bold">Mi Familia</span>
              </p>
              <p>
                <span className="font-light">De:</span>{' '}
                <span className="font-bold">Con Amor ❤️</span>
              </p>
            </div>
          </div>

          {/* Parte TRASERA del sobre */}
          <div
            className="envelope-back"
            style={{
              gridArea: '1/1',
              width: '100%',
              height: '100%',
              backgroundColor: '#d14d44',
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
              isolation: 'isolate',
              position: 'relative'
            }}
          >
            {/* Solapas traseras (estáticas) - conic gradient */}
            <div
              className="absolute inset-0 z-3"
              style={{
                backgroundImage: `conic-gradient(
                  transparent 60deg,
                  #c24e46 60deg 120deg,
                  #e15349 120deg 240deg,
                  #c24e46 240deg 300deg,
                  transparent 300deg
                )`
              }}
            />

            {/* Solapa superior que se abre */}
            <div
              ref={topFoldRef}
              className="top-fold"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                backgroundColor: '#d14d44',
                clipPath: 'polygon(0% 0%, 50% 55%, 100% 0%)',
                transformOrigin: 'top',
                transformStyle: 'preserve-3d'
              }}
            />

            {/* La CARTA que sale */}
            <div
              ref={letterRef}
              className="letter"
              style={{
                position: 'absolute',
                bottom: '5px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                height: 'var(--letter-base-height)', // Usa variable CSS responsive
                backgroundColor: '#fff',
                color: '#c0392b',
                padding: '1.5rem 2rem',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                zIndex: 2,
                overflowY: 'auto',
                fontSize: '0.875rem'
              }}
            >
              <div className="flex flex-col gap-4 items-center text-center">
                {/* Icono superior */}
                <div className="text-5xl md:text-7xl">🎁</div>

                {isNameRevealed && recipientName ? (
                  <>
                    <h2 className="text-xl md:text-3xl font-bold text-christmas-red">
                      ¡Tu Amigo Secreto es!
                    </h2>
                    <h3 className="text-2xl md:text-4xl font-bold text-christmas-green">
                      {recipientName}
                    </h3>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl md:text-3xl font-bold text-christmas-red">
                      Tu Amigo Secreto desea...
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 italic">
                      El nombre se revelará el 24 de diciembre
                    </p>
                  </>
                )}

                {/* Lista de regalos */}
                <div className="w-full bg-red-50 rounded-lg p-4 border-2 border-christmas-gold">
                  <h4 className="text-base md:text-xl font-bold text-christmas-dark mb-3 flex items-center gap-2 justify-center">
                    <span>🎁</span> Lista de Deseos:
                  </h4>
                  <ul className="space-y-2 text-left">
                    {giftOptions.map((option, index) => (
                      <li 
                        key={index}
                        className="flex items-start gap-2 text-gray-800 bg-white p-2 md:p-3 rounded-lg shadow-sm"
                      >
                        <span className="shrink-0 w-6 h-6 bg-christmas-red text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-xs md:text-sm">{option}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t-2 border-christmas-gold w-full">
                  <div className="flex justify-center gap-2 text-2xl md:text-3xl mb-2">
                    <span>🎄</span>
                    <span>⭐</span>
                    <span>🎅</span>
                    <span>❄️</span>
                    <span>🎁</span>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 italic">
                    ¡Feliz Intercambio de Regalos!
                  </p>
                </div>

                {!isNameRevealed && (
                  <div className="mt-4 py-6 bg-red-50 rounded-lg border-2 border-christmas-red w-full">
                    <span className="text-4xl md:text-5xl mb-3 block">🤫</span>
                    <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                      ¡Es un secreto!
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600">
                      El nombre se revelará pronto...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sombra del sobre */}
        <div
          className="absolute left-1/2"
          style={{
            top: '110%',
            transform: 'translateX(-50%)',
            width: '85%',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(56, 6, 6, 0.4)',
            filter: 'blur(15px)'
          }}
        />
      </div>

      {/* Indicador de scroll */}
      <div 
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-center animate-bounce z-50"
        style={{
          opacity: scrollProgress < 0.6 ? 1 : 0,
          transition: 'opacity 0.3s',
          pointerEvents: 'none'
        }}
      >
        <p className="text-christmas-red font-display text-sm md:text-lg bg-white/90 px-6 py-3 rounded-full shadow-lg border-2 border-christmas-red">
          ↓ Desliza para abrir el sobre ↓
        </p>
      </div>
    </div>
  );
}
