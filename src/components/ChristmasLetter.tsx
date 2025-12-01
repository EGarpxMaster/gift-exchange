import { useState, useEffect, useRef } from 'react';
import { Gift, Users } from 'lucide-react';
import { animate } from 'animejs';

interface ChristmasLetterProps {
  onRegister: () => void;
  onDashboard: () => void;
}

export function ChristmasLetter({ onRegister, onDashboard }: ChristmasLetterProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const envelopeTopRef = useRef<HTMLDivElement>(null);
  const envelopeLeftRef = useRef<HTMLDivElement>(null);
  const envelopeRightRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const envelopeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calcular progreso del scroll (0 a 1)
      // Ajustamos para que empiece en 0 cuando el contenedor llega al top del viewport
      // y termine cuando se ha scrolleado el 80% de la altura de la ventana
      const scrollStart = 0;
      const scrollEnd = windowHeight * 0.8; // Completar animación un poco antes
      const scrollRange = scrollEnd - scrollStart;
      const currentScroll = -rect.top;
      
      const progress = Math.max(0, Math.min(1, (currentScroll - scrollStart) / scrollRange));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Animar la solapa superior del sobre
    if (envelopeTopRef.current) {
      animate(envelopeTopRef.current, {
        rotateX: -180 + (scrollProgress * 180),
        duration: 100,
        easing: 'easeOutQuad',
      });
    }

    // Animar solapas laterales
    if (envelopeLeftRef.current) {
      animate(envelopeLeftRef.current, {
        rotateY: scrollProgress * 45,
        duration: 100,
        easing: 'easeOutQuad',
      });
    }

    if (envelopeRightRef.current) {
      animate(envelopeRightRef.current, {
        rotateY: -scrollProgress * 45,
        duration: 100,
        easing: 'easeOutQuad',
      });
    }

    // Animar la carta saliendo del sobre
    if (letterRef.current) {
      animate(letterRef.current, {
        translateY: `${50 - (scrollProgress * 50)}%`, // De 50% (abajo/adentro) a 0% (posición natural)
        opacity: Math.min(1, Math.max(0, (scrollProgress - 0.2) * 2)),
        duration: 100,
        easing: 'easeOutCubic',
      });
    }

    // Animar el contenedor del sobre (fade out)
    if (envelopeContainerRef.current) {
      animate(envelopeContainerRef.current, {
        opacity: Math.max(0, 1 - (scrollProgress * 1.2)),
        duration: 100,
        easing: 'linear',
      });
    }
  }, [scrollProgress]);

  return (
    <div ref={containerRef} className="min-h-[200vh] relative">
      {/* Contenedor de la carta */}
      <div className="sticky top-20 flex items-center justify-center py-8 px-4">
        <div 
          className="relative w-full max-w-3xl"
          style={{
            perspective: '2000px',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Sobre */}
          <div 
            ref={envelopeContainerRef}
            className="absolute inset-0 pointer-events-none z-30"
            style={{ 
              transformStyle: 'preserve-3d',
              opacity: 1,
            }}
          >
            <div className="relative w-full" style={{ height: '700px', transformStyle: 'preserve-3d' }}>
              
              {/* Parte trasera del sobre (base) */}
              <div className="absolute left-0 right-0 top-32 h-96 bg-linear-to-b from-christmas-red to-red-800 border-4 border-christmas-gold rounded-lg shadow-2xl">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Gift className="w-16 h-16 text-christmas-gold mx-auto mb-2 animate-wiggle" />
                    <p className="text-christmas-gold font-display text-xl">
                      Intercambio de Regalos
                    </p>
                    <p className="text-christmas-gold font-display text-lg">
                      2025
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Solapas laterales del sobre */}
              <div 
                ref={envelopeLeftRef}
                className="absolute left-0 top-32 w-1/2 h-96 bg-linear-to-br from-red-700 to-christmas-red border-4 border-l-0 border-christmas-gold origin-left"
                style={{
                  clipPath: 'polygon(0 0, 100% 50%, 100% 100%, 0 50%)',
                  transformStyle: 'preserve-3d',
                  transform: 'rotateY(0deg)',
                }}
              ></div>
              
              <div 
                ref={envelopeRightRef}
                className="absolute right-0 top-32 w-1/2 h-96 bg-linear-to-bl from-red-700 to-christmas-red border-4 border-r-0 border-christmas-gold origin-right"
                style={{
                  clipPath: 'polygon(0 50%, 0 100%, 100% 50%, 100% 0)',
                  transformStyle: 'preserve-3d',
                  transform: 'rotateY(0deg)',
                }}
              ></div>
              
              {/* Solapa superior del sobre */}
              <div 
                ref={envelopeTopRef}
                className="absolute left-0 right-0 top-32 h-64 bg-linear-to-br from-christmas-red via-red-700 to-christmas-red border-4 border-christmas-gold origin-top shadow-2xl z-40"
                style={{
                  clipPath: 'polygon(0 0, 50% 60%, 100% 0)',
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(-180deg)',
                }}
              >
                <div className="absolute inset-0 flex items-start justify-center pt-8">
                  <div className="text-6xl opacity-60">🎄</div>
                </div>
              </div>
            </div>
          </div>

          {/* Carta */}
          <div 
            ref={letterRef}
            className="relative"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'translateY(50%)',
              opacity: 0,
            }}
          >
            <div 
              className="relative bg-white rounded-lg shadow-2xl border-4 border-christmas-red overflow-hidden"
              style={{
                minHeight: '700px',
              }}
            >
              {/* Borde decorativo rojo navideño */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Esquinas decorativas */}
                <svg className="absolute top-0 left-0 w-32 h-32 text-christmas-red" viewBox="0 0 100 100">
                  <path d="M0,0 L100,0 L100,20 Q50,40 0,20 Z" fill="currentColor" />
                  <path d="M0,0 L20,0 L20,100 Q40,50 20,0 Z" fill="currentColor" />
                </svg>
                <svg className="absolute top-0 right-0 w-32 h-32 text-christmas-red transform rotate-90" viewBox="0 0 100 100">
                  <path d="M0,0 L100,0 L100,20 Q50,40 0,20 Z" fill="currentColor" />
                  <path d="M0,0 L20,0 L20,100 Q40,50 20,0 Z" fill="currentColor" />
                </svg>
                <svg className="absolute bottom-0 left-0 w-32 h-32 text-christmas-red transform -rotate-90" viewBox="0 0 100 100">
                  <path d="M0,0 L100,0 L100,20 Q50,40 0,20 Z" fill="currentColor" />
                  <path d="M0,0 L20,0 L20,100 Q40,50 20,0 Z" fill="currentColor" />
                </svg>
                <svg className="absolute bottom-0 right-0 w-32 h-32 text-christmas-red transform rotate-180" viewBox="0 0 100 100">
                  <path d="M0,0 L100,0 L100,20 Q50,40 0,20 Z" fill="currentColor" />
                  <path d="M0,0 L20,0 L20,100 Q40,50 20,0 Z" fill="currentColor" />
                </svg>
              </div>

            {/* Decoraciones navideñas en la parte superior */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-christmas-red flex items-center justify-between px-8 z-10">
              <div className="flex items-center gap-3">
                <div className="text-4xl animate-wiggle">🎁</div>
                <div className="text-3xl">🎄</div>
              </div>
              <h1 className="font-display text-3xl text-white">Querida Familia</h1>
              <div className="flex items-center gap-3">
                <div className="text-3xl">🔔</div>
                <div className="text-4xl animate-wiggle">🎁</div>
              </div>
            </div>

            {/* Decoración de hojas y esferas en las esquinas superiores */}
            <div className="absolute top-20 left-4 z-20 flex gap-2">
              <div className="text-5xl">🎄</div>
              <div className="text-3xl animate-bounce-slow">🔴</div>
            </div>
            <div className="absolute top-20 right-4 z-20 flex gap-2">
              <div className="text-3xl animate-bounce-slow">🔴</div>
              <div className="text-5xl">🎄</div>
            </div>

            {/* Contenido de la carta */}
            <div className="relative z-10 pt-32 pb-12 px-8 md:px-16">
              
              {/* Mensaje principal con líneas decorativas */}
              <div className="space-y-4 mb-8">
                <div className="border-b border-gray-300 pb-3">
                  <p className="text-lg text-gray-800 leading-relaxed italic">
                    Este año queremos celebrar juntos de una manera muy especial y llena de sorpresas...
                  </p>
                </div>
                
                <div className="border-b border-gray-300 pb-3">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    Te invitamos a nuestro <strong className="text-christmas-red">Intercambio de Regalos de Fin de Año 2025</strong> para dar la bienvenida al Año Nuevo 2026 con alegría.
                  </p>
                </div>

                <div className="border-b border-gray-300 pb-3">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    Será una celebración llena de amor, risas y sorpresas para toda la familia.
                  </p>
                </div>
              </div>

              {/* Información de categorías con diseño tradicional */}
              <div className="bg-linear-to-r from-red-50 to-green-50 rounded-lg p-6 mb-6 border-2 border-christmas-gold shadow-md">
                <div className="text-center mb-4">
                  <h3 className="font-display text-2xl text-christmas-red">
                    ⭐ Categorías de Intercambio ⭐
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-yellow-400 shadow transform hover:scale-105 transition">
                    <div className="text-center mb-2">
                      <span className="text-4xl animate-wiggle">👑</span>
                    </div>
                    <h4 className="font-bold text-lg text-center text-christmas-dark mb-2">Categoría Élite</h4>
                    <div className="border-t-2 border-b-2 border-christmas-gold py-2 mb-2">
                      <p className="text-3xl font-bold text-christmas-red text-center">$1,000</p>
                      <p className="text-sm text-center text-gray-600">MXN</p>
                    </div>
                    <p className="text-sm text-center text-gray-700">Sugerido para adultos</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border-2 border-green-400 shadow transform hover:scale-105 transition">
                    <div className="text-center mb-2">
                      <span className="text-4xl animate-wiggle">🎈</span>
                    </div>
                    <h4 className="font-bold text-lg text-center text-christmas-dark mb-2">Categoría Diversión</h4>
                    <div className="border-t-2 border-b-2 border-christmas-gold py-2 mb-2">
                      <p className="text-3xl font-bold text-christmas-green text-center">$500</p>
                      <p className="text-sm text-center text-gray-600">MXN</p>
                    </div>
                    <p className="text-sm text-center text-gray-700">Dedicada a los niños</p>
                  </div>
                </div>
              </div>

              {/* Fechas importantes estilo lista decorativa */}
              <div className="bg-white rounded-lg p-6 mb-6 border-2 border-christmas-red shadow-md">
                <div className="text-center mb-4">
                  <h3 className="font-display text-2xl text-christmas-green">
                    📅 Fechas Importantes 📅
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 border-b border-gray-200 pb-3">
                    <span className="text-3xl">📝</span>
                    <div className="flex-1 border-b-2 border-dotted border-gray-300 pb-1">
                      <p className="font-bold text-christmas-dark">Período de Registro</p>
                      <p className="text-gray-600">Del 5 al 15 de Diciembre de 2025</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 border-b border-gray-200 pb-3">
                    <span className="text-3xl">🎲</span>
                    <div className="flex-1 border-b-2 border-dotted border-gray-300 pb-1">
                      <p className="font-bold text-christmas-dark">Sorteo Automático</p>
                      <p className="text-gray-600">15 de Diciembre de 2025</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">🎁</span>
                    <div className="flex-1 border-b-2 border-dotted border-gray-300 pb-1">
                      <p className="font-bold text-christmas-dark">Revelación de Nombres</p>
                      <p className="text-gray-600">24 de Diciembre de 2025</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                <button
                  onClick={onRegister}
                  className="group relative bg-linear-to-r from-christmas-red to-red-700 hover:from-red-700 hover:to-christmas-red text-white font-bold py-4 px-8 rounded-lg shadow-xl transform transition hover:scale-105 border-2 border-white"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform rounded-lg"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    <Gift className="w-6 h-6" />
                    ¡Quiero Participar!
                  </span>
                </button>
                
                <button
                  onClick={onDashboard}
                  className="group relative bg-linear-to-r from-christmas-green to-green-800 hover:from-green-800 hover:to-christmas-green text-white font-bold py-4 px-8 rounded-lg shadow-xl transform transition hover:scale-105 border-2 border-white"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform rounded-lg"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    <Users className="w-6 h-6" />
                    Ya estoy registrado
                  </span>
                </button>
              </div>

              {/* Firma con diseño tradicional */}
              <div className="text-center mt-8 pt-6 border-t-2 border-christmas-gold">
                <p className="font-display text-2xl text-christmas-red mb-3">
                  ¡Nos vemos pronto para celebrar juntos!
                </p>
                <div className="flex justify-center gap-2 text-3xl mb-3">
                  <span>❤️</span>
                  <span>🎄</span>
                  <span>✨</span>
                </div>
                <p className="text-gray-600 italic text-lg">
                  Con cariño, <strong className="text-christmas-red">la Familia</strong>
                </p>
              </div>
            </div>

            {/* Decoración inferior con árboles navideños y Santa */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-christmas-red to-transparent flex items-end justify-center pb-4 gap-8">
              <div className="text-5xl animate-float">🎄</div>
              <div className="text-5xl animate-float" style={{ animationDelay: '0.5s' }}>🎄</div>
              <div className="text-6xl animate-bounce-slow">🎅</div>
              <div className="text-5xl animate-float" style={{ animationDelay: '1s' }}>🎄</div>
              <div className="text-5xl animate-float" style={{ animationDelay: '1.5s' }}>🎄</div>
            </div>

            {/* Textura de papel */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-5 mix-blend-multiply"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4"/%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")',
              }}
            ></div>
          </div>
          </div>

          {/* Indicador de scroll (solo visible al inicio) */}
          {scrollProgress < 0.3 && (
            <div 
              className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center animate-bounce"
              style={{ opacity: 1 - scrollProgress * 3 }}
            >
              <p className="text-christmas-red font-display text-lg mb-2">
                ↓ Desliza para abrir el sobre ↓
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
