import { useRef, useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { LetterCard } from './LetterCard';
import { EnvelopeAnimation } from './EnvelopeAnimation';

interface ChristmasLetterProps {
  onRegister: () => void;
  onDashboard: () => void;
}

export function ChristmasLetter(props: ChristmasLetterProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleWantToParticipate = () => {
    setShowAnimation(true);
    // Iniciar animación progresiva
    let progress = 0;
    const duration = 5000;
    const fps = 60;
    const increment = 1 / (duration / 1000 * fps);
    
    const animate = () => {
      progress += increment;
      if (progress <= 1) {
        setAnimationProgress(progress);
        requestAnimationFrame(animate);
      } else {
        setAnimationProgress(1);
      }
    };
    requestAnimationFrame(animate);
    
    // Intentar reproducir soundtrack tras interacción del usuario
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay puede bloquearse; el botón de música permitirá reproducir
      });
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  // Cálculos de animación
  const clampedProgress = Math.min(Math.max(animationProgress, 0), 1);
  const rotation = clampedProgress <= 0.25 ? (clampedProgress / 0.25) * 180 : 180;
  
  const flapProgress = clampedProgress <= 0.25 ? 0 : clampedProgress >= 0.4 ? 1 : (clampedProgress - 0.25) / 0.15;
  const flapRotation = flapProgress * 180;
  
  const letterProgress = clampedProgress <= 0.4 ? 0 : clampedProgress >= 0.7 ? 1 : (clampedProgress - 0.4) / 0.3;
  const letterHeight = letterProgress === 0 ? 'min(40vw, 150px)' : `min(${40 + (letterProgress * 150)}vw, ${150 + (letterProgress * 450)}px)`;
  const letterBottom = '5px';
  
  const envelopeProgress = clampedProgress <= 0.7 ? 0 : (clampedProgress - 0.7) / 0.3;
  const envelopeTranslateY = envelopeProgress * 150;
  const envelopeOpacity = 1 - envelopeProgress;
  const isFinal = clampedProgress >= 1;

  return (
    <div className="relative min-h-screen flex items-center justify-center" style={{
      backgroundImage: 'url(/images/christmas-background.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Overlay para mejor legibilidad */}
      <div className="absolute inset-0 bg-black/20" style={{ zIndex: 0 }} />
      
      {/* Navbar Navideño */}
      <div className="fixed top-0 left-0 right-0 z-50" style={{
        background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 50%, #c0392b 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '2rem' }}>🎄</span>
            <h1 className="text-xl md:text-2xl font-bold" style={{ 
              color: '#fff',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Intercambio de Regalos 2025
            </h1>
            <span style={{ fontSize: '2rem' }}>🎁</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ 
              fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              color: '#fff5f5',
              fontWeight: '600',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              🎅 ¡Felices Fiestas!
            </span>
            <button
              onClick={() => setMuted(m => !m)}
              className="ml-2 px-3 py-1 rounded-lg text-sm font-semibold"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.4)'
              }}
            >{muted ? '🔇 Música' : '🔊 Música'}</button>
          </div>
        </div>
        {/* Borde inferior decorativo */}
        <div style={{
          height: '4px',
          background: 'repeating-linear-gradient(90deg, #27ae60 0px, #27ae60 20px, #fff 20px, #fff 40px, #c0392b 40px, #c0392b 60px)'
        }} />
      </div>

      {/* Contenido principal con margen superior para el navbar */}
      <div className="relative z-10 w-full" style={{ marginTop: '80px' }}>
        {!showAnimation ? (
          // Pantalla inicial con botones
          <div className="flex flex-col items-center justify-center gap-8 p-8">
            <h1 className="text-4xl md:text-6xl font-bold text-center mb-4" style={{ 
              color: '#c0392b',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              🎄 Intercambio de Regalos 2025 🎁
            </h1>
            
            <div className="flex flex-col md:flex-row gap-6">
              <button
                onClick={handleWantToParticipate}
                className="px-8 py-4 text-xl font-bold rounded-lg transform transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                  color: 'white'
                }}
              >
                � Quiero Participar
              </button>
              
              <button
                onClick={props.onDashboard}
                className="px-8 py-4 text-xl font-bold rounded-lg transform transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                  color: 'white'
                }}
              >
                ✨ Ya Estoy Inscrito
              </button>
            </div>
          </div>
        ) : (
          // Animación del sobre y la carta
          <div className="fixed inset-0 overflow-hidden flex items-center justify-center" style={{ perspective: '1400px' }}>
            {/* Estado final: carta independiente del sobre */}
            {isFinal && (
              <div className="fixed inset-0 flex items-center justify-center overflow-y-auto" style={{ top: '16rem' }}>
                <div
                  className="bg-white shadow-2xl my-8"
                  style={{
                    width: 'min(95vw, 700px)',
                    padding: 'clamp(1.5rem, 4vw, 3rem)',
                    borderRadius: '12px',
                    zIndex: 10,
                  }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-red-600 text-center">
                    🎉 ¡Intercambio de Regalos de Fin de Año 2025! 🎁
                  </h2>
                  
                  <div className="space-y-5 text-sm md:text-base leading-relaxed">
                    <p className="text-center font-semibold text-base md:text-lg">
                      ¡Queremos dar la bienvenida al Año Nuevo 2026 de una manera muy especial y llena de sorpresas!
                    </p>

                    <p className="text-center text-base md:text-lg bg-red-50 p-3 md:p-4 rounded-lg border-2 border-red-300">
                      Están cordialmente invitados a participar en nuestro tradicional<br />
                      <strong className="text-lg md:text-xl text-red-700">Intercambio de Regalos</strong><br />
                      el próximo <strong>24 de diciembre de 2025</strong>
                    </p>

                    <section>
                      <h3 className="font-bold text-lg md:text-xl mb-3 text-green-700">🌟 Categorías de Intercambio:</h3>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 md:p-4 rounded-lg border-2 border-yellow-400 shadow-sm">
                          <p className="font-bold text-base md:text-lg text-amber-800">Categoría Élite - $1,000 MXN</p>
                          <p className="text-xs md:text-sm text-gray-700 mt-1">Monto Sugerido: $1,000 pesos mexicanos</p>
                          <p className="text-xs md:text-sm text-gray-600">Participantes: Especialmente diseñada para Adultos</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 md:p-4 rounded-lg border-2 border-blue-400 shadow-sm">
                          <p className="font-bold text-base md:text-lg text-blue-800">Categoría Diversión - $500 MXN</p>
                          <p className="text-xs md:text-sm text-gray-700 mt-1">Monto Sugerido: $500 pesos mexicanos</p>
                          <p className="text-xs md:text-sm text-gray-600">Participantes: Dedicada a los Niños</p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                        <p className="text-xs md:text-sm italic text-gray-700">
                          <strong>Nota para Adultos:</strong> Si por alguna razón la participación en la categoría de $1,000 pesos 
                          no es posible, ¡no se preocupen! Simplemente comuníquenoslo y con gusto los asignaremos a la 
                          categoría de $500 pesos. ¡Lo importante es que todos participen!
                        </p>
                      </div>
                    </section>

                    <section>
                      <h3 className="font-bold text-lg md:text-xl mb-3 text-green-700">💻 El Secreto Mejor Guardado: El Sistema de Emmanuel</h3>
                      <p className="mb-3 font-semibold text-purple-700">¡Hemos creado un método infalible para garantizar que la sorpresa sea total!</p>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                          <p className="pt-1 text-sm md:text-base"><strong>Emmanuel está creando un programa especial</strong> que mantendrá el secreto hasta el gran día.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                          <p className="pt-1 text-sm md:text-base">Cada participante deberá <strong>anexar una lista de 5 o más ideas de regalo</strong> que le gustaría recibir.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                          <p className="pt-1 text-sm md:text-base">El programa hará la <strong>"rifa" en secreto</strong>, y solo te dirá qué quiere la persona que te tocó regalar.</p>
                        </div>
                      </div>
                      <p className="mt-4 p-3 bg-red-50 rounded-lg border-2 border-red-300 font-semibold text-center text-red-700 text-sm md:text-base">
                        De esta manera, nadie sabrá quién le regala, asegurando que la revelación<br className="hidden md:inline" />
                        del 24 de diciembre sea una maravillosa sorpresa para todos.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-bold text-lg md:text-xl mb-3 text-green-700">📅 Fechas Importantes del Sistema:</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                          <span className="text-xl md:text-2xl">📝</span>
                          <div>
                            <p className="font-bold text-sm md:text-base">5-15 de diciembre de 2025</p>
                            <p className="text-xs md:text-sm text-gray-600">Periodo de Inscripción</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-purple-50 rounded">
                          <span className="text-xl md:text-2xl">🎲</span>
                          <div>
                            <p className="font-bold text-sm md:text-base">15 de diciembre de 2025</p>
                            <p className="text-xs md:text-sm text-gray-600">Sorteo Automático</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                          <span className="text-xl md:text-2xl">🎁</span>
                          <div>
                            <p className="font-bold text-sm md:text-base">16-23 de diciembre de 2025</p>
                            <p className="text-xs md:text-sm text-gray-600">Consulta las opciones de regalo (sin saber el nombre)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-red-50 rounded border-2 border-red-300">
                          <span className="text-xl md:text-2xl">🎉</span>
                          <div>
                            <p className="font-bold text-red-700 text-sm md:text-base">24 de diciembre de 2025</p>
                            <p className="text-xs md:text-sm text-red-600">¡Revelación de Nombres y Gran Intercambio!</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="font-bold text-lg md:text-xl mb-3 text-green-700">🔒 Tu Privacidad y Seguridad:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <p className="text-xs md:text-sm">Nombres encriptados en nuestro sistema</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <p className="text-xs md:text-sm">Sin intercambios recíprocos (A→B, B≠A)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <p className="text-xs md:text-sm">Solo ves opciones de regalo (sin nombre) hasta el 24</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <p className="text-xs md:text-sm">Revelación automática el día del intercambio</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <p className="text-xs md:text-sm">No puedes tocarte a ti mismo</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          <p className="text-xs md:text-sm">Sistema seguro y confiable</p>
                        </div>
                      </div>
                    </section>

                    <div className="text-center mt-6 p-4 md:p-6 bg-gradient-to-br from-red-100 via-green-100 to-red-100 rounded-lg shadow-lg border-2 border-green-400">
                      <p className="text-2xl md:text-3xl font-bold text-red-700 mb-3">
                        📅 ¡Confirma tu Participación!
                      </p>
                      <p className="text-lg md:text-xl font-semibold mb-2">
                        Antes del <span className="text-red-600">5 de diciembre</span>
                      </p>
                      <p className="text-xs md:text-sm text-gray-700 mt-3 mb-4">
                        Registra tu participación del <strong>5 al 15 de diciembre</strong> para ser parte de esta maravillosa celebración
                      </p>
                      <button
                        onClick={() => setShowModal(true)}
                        className="px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-bold rounded-lg transform transition-all hover:scale-105 active:scale-95 shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        ¡Quiero Registrarme! 🎅
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Sobre con animación de descenso */}
            <div 
              className="relative"
              style={{ 
                transform: `translateY(${isFinal ? 0 : envelopeTranslateY}vh)`,
                opacity: isFinal ? 0 : envelopeOpacity,
                transition: 'none',
                pointerEvents: isFinal ? 'none' : (envelopeOpacity < 0.1 ? 'none' : 'auto')
              }}
            >
              {/* Sombra */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  bottom: '-10%',
                  width: 'min(76.5vw, 510px)',
                  height: '40px',
                  background: 'rgba(56, 6, 6, 0.4)',
                  filter: 'blur(15px)',
                  transform: `translateX(-50%)`,
                  transition: 'none'
                }}
              />

              {/* Contenedor del sobre que rota */}
              <div
                className="relative"
                style={{
                  width: 'min(90vw, 600px)',
                  height: 'min(53.33vw, 350px)',
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${rotation}deg)`,
                  transition: 'none'
                }}
              >
                {/* Cara FRONTAL del sobre (diseño navideño) */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-red-700"
                  style={{
                    backfaceVisibility: 'hidden'
                  }}
                >
                  {/* Textura del papel */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
                    }}
                  />

                  {/* Marco interior tipo costura */}
                  <div className="absolute inset-4 border-2 border-white/60 border-dashed pointer-events-none" />

                  {/* Borde con franjas diagonales (estilo postal) */}
                  <div className="absolute top-3 left-10 right-10 h-4 opacity-90" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0 12px, transparent 12px 24px)' }} />
                  <div className="absolute bottom-3 left-10 right-10 h-4 opacity-90" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0 12px, transparent 12px 24px)' }} />
                  <div className="absolute top-10 bottom-10 left-3 w-4 opacity-90" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #fff 0 12px, transparent 12px 24px)' }} />
                  <div className="absolute top-10 bottom-10 right-3 w-4 opacity-90" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #fff 0 12px, transparent 12px 24px)' }} />

                  {/* Tipografías y marcados postales */}
                  <div className="absolute top-10 left-10 right-32 text-white">
                    <div className="mb-2">
                      <p className="tracking-widest font-bold" style={{ fontSize: 'clamp(12px, 1.8vw, 16px)' }}>SPECIAL DELIVERY</p>
                      <div className="h-[2px] w-48 bg-white/80 mt-1" />
                    </div>
                    <p className="font-semibold text-white/90" style={{ fontSize: 'clamp(12px, 1.8vw, 16px)' }}>URGENT</p>

                    <div className="mt-6 font-extrabold leading-tight" style={{ fontSize: 'clamp(18px, 4.05vw, 36px)' }}>
                      <div className="text-white/90 mb-1" style={{ fontSize: 'clamp(14px, 2.7vw, 24px)' }}>To</div>
                      <div>Santa <span className="tracking-wider">CLAUS</span></div>
                      <div style={{ fontSize: 'clamp(16px, 3.375vw, 30px)' }}>North Pole</div>
                    </div>
                  </div>

                  {/* Estampilla con borde dentado (esquina superior derecha) */}
                  <div className="absolute top-8 right-8">
                    <svg width="96" height="76" viewBox="0 0 96 76" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <clipPath id="stamp-edge">
                          <path d="M6 0 L12 6 L18 0 L24 6 L30 0 L36 6 L42 0 L48 6 L54 0 L60 6 L66 0 L72 6 L78 0 L84 6 L90 0 L96 6 L96 70 L90 76 L84 70 L78 76 L72 70 L66 76 L60 70 L54 76 L48 70 L42 76 L36 70 L30 76 L24 70 L18 76 L12 70 L6 76 L0 70 L0 6 Z" />
                        </clipPath>
                      </defs>
                      <g clipPath="url(#stamp-edge)">
                        <rect x="0" y="0" width="96" height="76" fill="#fff" />
                        <rect x="6" y="6" width="84" height="64" rx="4" fill="#f8fafc" />
                        <text x="48" y="48" textAnchor="middle" fontFamily="serif" fontSize="28" fill="#16a34a">✽</text>
                      </g>
                      <rect x="0.5" y="0.5" width="95" height="75" fill="none" stroke="#ffffff" strokeOpacity="0.9" />
                    </svg>
                  </div>

                  {/* Sello postal circular + ondas */}
                  <div className="absolute top-10 left-14">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-2 border-black/30 flex items-center justify-center">
                        <div className="text-center text-black/40 font-serif" style={{ fontSize: 'clamp(7px, 1.0125vw, 9px)' }}>
                          <div>NORTH POLE</div>
                          <div>★ DEC 24 ★</div>
                          <div>POST</div>
                        </div>
                      </div>
                      {/* Ondas */}
                      <div className="absolute top-6 -right-16 w-28 h-8 text-black/30">
                        <svg viewBox="0 0 120 24" className="w-full h-full">
                          <path d="M0,12 C20,2 40,22 60,12 C80,2 100,22 120,12" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cara TRASERA del sobre (con la carta) */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-red-700"
                  style={{
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                    perspective: '1000px'
                  }}
                >
                  {/* Textura */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
                    }}
                  />

                  {/* Pliegues del sobre (fondo) */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      zIndex: 3,
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
                    className="absolute inset-0"
                    style={{
                      zIndex: flapProgress >= 1 ? 0 : 10,
                      background: '#d14d44',
                      clipPath: 'polygon(0% 0%, 50% 55%, 100% 0%)',
                      transformOrigin: 'top',
                      transform: `rotateX(${flapRotation}deg)`,
                      transition: 'none'
                    }}
                  />

                  {/* Líneas de pliegues (suaves) */}
                  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                    <div className="absolute left-4 bottom-4 h-[65%] w-[2px] bg-black/20" style={{ transform: 'rotate(45deg)', transformOrigin: 'bottom left' }} />
                    <div className="absolute right-4 bottom-4 h-[65%] w-[2px] bg-black/20" style={{ transform: 'rotate(-45deg)', transformOrigin: 'bottom right' }} />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[18%] h-[2px] w-[70%] bg-black/20" />
                  </div>

                  {/* Cuerda vertical */}
                  <div className="absolute top-0 bottom-0" style={{ left: '62%', zIndex: 4 }}>
                    <div
                      className="h-full w-[10px] rounded-full"
                      style={{
                        backgroundImage: 'repeating-linear-gradient( to bottom, #c0845a 0 6px, #a26d47 6px 12px )',
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.15) inset, 0 0 10px rgba(0,0,0,0.05)'
                      }}
                    />
                    {/* Lazo */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-3">
                      <div className="absolute -left-6 -top-2 w-12 h-8 rounded-full border-2 border-[#c0845a]/80" style={{ transform: 'rotate(-20deg)' }} />
                      <div className="absolute left-2 -top-2 w-12 h-8 rounded-full border-2 border-[#c0845a]/80" style={{ transform: 'rotate(20deg)' }} />
                      <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-[#c0845a]" />
                    </div>
                    {/* Acebo + bayas */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-3" aria-hidden>
                      <svg width="84" height="52" viewBox="0 0 84 52" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 26 C18 18, 26 18, 34 26 C26 24, 18 28, 10 26 Z" fill="#166534" />
                        <path d="M34 26 C42 18, 50 18, 58 26 C50 24, 42 28, 34 26 Z" fill="#166534" />
                        <circle cx="20" cy="26" r="5" fill="#b91c1c" />
                        <circle cx="28" cy="22" r="5" fill="#dc2626" />
                        <circle cx="26" cy="30" r="4" fill="#991b1b" />
                      </svg>
                    </div>
                  </div>

                  {/* Texto dorado */}
                  <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
                    <div className="text-center" style={{ color: '#d4af37', textShadow: '0 1px 0 rgba(0,0,0,0.2)' }}>
                      <div style={{ fontSize: 'clamp(18px, 3.6vw, 36px)' }} className="italic">Intercambio</div>
                      <div style={{ fontSize: 'clamp(18px, 3.6vw, 36px)' }} className="italic -mt-1">de Regalos</div>
                      <div style={{ fontSize: 'clamp(16px, 2.7vw, 30px)' }} className="mt-2">2025</div>
                    </div>
                  </div>

                  {/* Sello de cera */}
                  <div className="absolute left-1/2" style={{ bottom: '14%', transform: 'translateX(-50%)', zIndex: 4 }}>
                    <div
                      className="w-16 h-16 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 35% 35%, #b5813c, #8b5e2f 60%, #6d471f)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.25)'
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center" style={{ color: '#f5e3b3' }}>❦</div>
                    </div>
                  </div>
                </div>

                {/* Carta que sale del sobre */}
                <div 
                  className="absolute bg-white shadow-2xl"
                  style={{
                    bottom: isFinal ? '12vh' : letterBottom,
                    left: '50%',
                    width: '90%',
                    height: isFinal ? 'auto' : letterHeight,
                    transform: 'translateX(-50%)',
                    zIndex: 2,
                    padding: 'clamp(1.5rem, 4vw, 3rem)',
                    borderRadius: '12px 12px 0 0',
                    transition: 'bottom 0.5s ease, height 0.5s ease, opacity 0.4s ease',
                    opacity: isFinal ? 0 : letterProgress,
                    overflowY: 'hidden',
                    display: isFinal ? 'none' : (letterProgress > 0 ? 'flex' : 'none'),
                    flexDirection: 'column',
                    gap: '1rem',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  {/* Compensar espejo por rotación Y de la cara trasera */}
                  <div style={{ transform: 'rotateY(180deg)', width: '100%' }}>
                  <h2 style={{ 
                    fontSize: 'clamp(24px, 4vw, 40px)', 
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    color: '#27ae60',
                    textAlign: 'center'
                  }}>
                    🎄 Intercambio de Regalos 2025 🎁
                  </h2>
                  
                  <p style={{ 
                    maxWidth: '50ch', 
                    lineHeight: '1.6',
                    fontSize: 'clamp(14px, 2vw, 20px)',
                    color: '#c0392b',
                    fontWeight: '700',
                    textAlign: 'center',
                    margin: '0 auto 1.5rem'
                  }}>
                    <strong>Fechas Importantes</strong>
                  </p>
                  <div style={{ 
                    maxWidth: '50ch', 
                    textAlign: 'center', 
                    lineHeight: '1.9',
                    fontSize: 'clamp(13px, 1.9vw, 18px)',
                    color: '#2c3e50',
                    margin: '0 auto 1rem'
                  }}>
                    <div>📝 Registro: <strong>5–15 de diciembre</strong></div>
                    <div>🎲 Sorteo automático: <strong>15 de diciembre</strong></div>
                    <div>🎁 Revelación de nombres: <strong>24 de diciembre</strong></div>
                  </div>
                  
                  <p style={{ 
                    maxWidth: '50ch', 
                    lineHeight: '1.6',
                    fontSize: 'clamp(14px, 2vw, 20px)',
                    color: '#c0392b',
                    fontWeight: '700',
                    textAlign: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <strong>Categorías</strong>
                  </p>
                  <div style={{ 
                    maxWidth: '52ch', 
                    textAlign: 'left', 
                    lineHeight: '1.9',
                    fontSize: 'clamp(13px, 1.9vw, 18px)',
                    color: '#2c3e50',
                    margin: '0 auto 1.25rem'
                  }}>
                    <p style={{ marginBottom: '0.5rem' }}>💎 <strong>Élite — $1,000 MXN</strong> (adultos)</p>
                    <p style={{ marginBottom: '0.5rem' }}>🎈 <strong>Diversión — $500 MXN</strong> (niños)</p>
                    <p style={{ marginBottom: '0.5rem', color: '#7f8c8d' }}>Si no puedes participar en Élite, te asignamos a Diversión.</p>
                  </div>

                  <div style={{ 
                    marginTop: '1rem',
                    padding: 'clamp(1rem, 3vw, 1.5rem)',
                    background: '#fff5f5',
                    borderRadius: '12px',
                    maxWidth: '52ch',
                    margin: '1rem auto 1.25rem',
                    border: '2px solid #ffebeb'
                  }}>
                    <p style={{ 
                      fontSize: 'clamp(13px, 1.8vw, 17px)', 
                      color: '#c0392b',
                      lineHeight: '1.8',
                      margin: 0
                    }}>
                      ✅ <strong>Requisitos de Registro</strong><br/>
                      • Nombre completo (se encripta en BD)<br/>
                      • Categoría (Élite/Diversión)<br/>
                      • Mínimo 5 ideas de regalo
                    </p>
                  </div>
                  <div style={{ 
                    maxWidth: '52ch', 
                    textAlign: 'left', 
                    lineHeight: '1.9',
                    fontSize: 'clamp(13px, 1.9vw, 18px)',
                    color: '#2c3e50',
                    margin: '0 auto 1rem'
                  }}>
                    <p style={{ marginBottom: '0.5rem' }}>🔒 Los nombres están encriptados en la base de datos.</p>
                    <p style={{ marginBottom: '0.5rem' }}>🕵️ Del 16 al 23 de dic: ves solo las opciones de regalo de tu asignado.</p>
                    <p style={{ marginBottom: '0.5rem' }}>🎉 El 24 de dic: se revelan los nombres con una animación festiva.</p>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                      onClick={() => setShowModal(true)}
                      className="px-8 py-4 text-xl font-bold rounded-lg transform transition-all hover:scale-105 active:scale-95 shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      ¡Quiero Registrarme! 🎅
                    </button>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Registro */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
            style={{ zIndex: 1000 }}
            onClick={() => setShowModal(false)}
          >
            <div 
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              <h2 className="text-3xl font-bold text-center mb-6" style={{ color: '#c0392b' }}>
                📝 Registro
              </h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                props.onRegister();
              }}>
                <div className="mb-4">
                  <label 
                    htmlFor="name" 
                    className="block text-lg font-semibold mb-2"
                    style={{ color: '#2c3e50' }}
                  >
                    Tu Nombre:
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
                    placeholder="Ingresa tu nombre completo"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label 
                    htmlFor="email" 
                    className="block text-lg font-semibold mb-2"
                    style={{ color: '#2c3e50' }}
                  >
                    Email (opcional):
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 text-lg font-bold rounded-lg transition-all hover:scale-105"
                    style={{
                      background: '#95a5a6',
                      color: 'white'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 text-lg font-bold rounded-lg transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                      color: 'white'
                    }}
                  >
                    Confirmar ✨
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Audio element for soundtrack */}
      <audio ref={audioRef} src="/music/christmas.mp3" autoPlay loop />
    </div>
  );
}
