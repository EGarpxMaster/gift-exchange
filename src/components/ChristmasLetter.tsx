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
    let progress = 0;
    const duration = 8000;
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
    
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
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
      {/* Audio soundtrack */}
      <audio ref={audioRef} src="/music/christmas.mp3" autoPlay loop />

      {/* Overlay para mejor legibilidad */}
      <div className="absolute inset-0 bg-black/20" style={{ zIndex: 0 }} />
      
      {/* Navbar */}
      <Navbar muted={muted} onToggleMute={() => setMuted(m => !m)} />

      {/* Contenido principal */}
      <div className="relative z-10 w-full pt-20">
        {!showAnimation ? (
          // Pantalla inicial con botones
          <div className="flex flex-col items-center justify-center gap-8 p-8 min-h-[calc(100vh-80px)]">
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
                🎁 Quiero Participar
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
          <div className="fixed inset-0 flex items-center justify-center pt-20 pb-8" style={{ perspective: '1400px' }}>
            {/* Estado final: carta independiente */}
            {isFinal && <LetterCard onRegister={() => setShowModal(true)} />}
            
            {/* Sobre con animación */}
            <EnvelopeAnimation
              rotation={rotation}
              flapRotation={flapRotation}
              letterHeight={letterHeight}
              letterBottom={letterBottom}
              envelopeTranslateY={envelopeTranslateY}
              envelopeOpacity={envelopeOpacity}
              isFinal={isFinal}
              letterProgress={letterProgress}
              flapProgress={flapProgress}
            />
          </div>
        )}
      </div>

      {/* Modal de registro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-red-600">Registro</h3>
            <p className="mb-4">El formulario de registro estará disponible del 5 al 15 de diciembre de 2025.</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
