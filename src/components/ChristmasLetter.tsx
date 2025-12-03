import { useEffect, useRef, useState } from 'react';

interface ChristmasLetterProps {
  onRegister: () => void;
  onDashboard: () => void;
}

export function ChristmasLetter(_props: ChristmasLetterProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 = trasera, 1 = frontal

  useEffect(() => {
    const onScroll = () => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight, 1);
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(scrolled / total);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const rotation = Math.min(Math.max(progress, 0), 1) * 180; // 0→180°

  return (
    <div className="relative min-h-[200vh]">
      {/* Pista invisible de scroll para el giro */}
      <div ref={trackRef} className="absolute inset-0 h-[200vh] pointer-events-none" />
      {/* Sobre fijo y centrado respecto al viewport */}
      <div className="sticky top-0 h-screen flex items-center justify-center pointer-events-none" style={{ perspective: '1400px' }}>
        {/* Tarjeta 3D que rota */}
        <div
          ref={cardRef}
          className="relative rounded-lg shadow-2xl"
          style={{
            width: 'min(90vw, 800px)',
            aspectRatio: '8 / 5',
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
            willChange: 'transform',
          }}
        >
            {/* Cara trasera (actual) */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-red-700 rounded-lg" style={{ backfaceVisibility: 'hidden' }}>
              {/* Textura del papel */}
              <div 
                className="absolute inset-0 opacity-10 rounded-lg"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Marco interior tipo costura */}
              <div className="absolute inset-4 rounded-md border-2 border-white/60 border-dashed pointer-events-none" />

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

            {/* Cara frontal */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-red-700 rounded-lg" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
              {/* Textura */}
              <div 
                className="absolute inset-0 opacity-10 rounded-lg"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Líneas de pliegues (suaves) */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-4 bottom-4 h-[65%] w-[2px] bg-black/20" style={{ transform: 'rotate(45deg)', transformOrigin: 'bottom left' }} />
                <div className="absolute right-4 bottom-4 h-[65%] w-[2px] bg-black/20" style={{ transform: 'rotate(-45deg)', transformOrigin: 'bottom right' }} />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[18%] h-[2px] w-[70%] bg-black/20" />
              </div>

              {/* Cuerda vertical */}
              <div className="absolute top-0 bottom-0" style={{ left: '62%' }}>
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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center" style={{ color: '#d4af37', textShadow: '0 1px 0 rgba(0,0,0,0.2)' }}>
                  <div style={{ fontSize: 'clamp(18px, 3.6vw, 36px)' }} className="italic">Intercambio</div>
                  <div style={{ fontSize: 'clamp(18px, 3.6vw, 36px)' }} className="italic -mt-1">de Regalos</div>
                  <div style={{ fontSize: 'clamp(16px, 2.7vw, 30px)' }} className="mt-2">2025</div>
                </div>
              </div>

              {/* Sello de cera */}
              <div className="absolute left-1/2" style={{ bottom: '14%', transform: 'translateX(-50%)' }}>
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
        </div>
      </div>
    </div>
  );
}
