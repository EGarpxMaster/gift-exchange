interface EnvelopeAnimationProps {
  rotation: number;
  flapRotation: number;
  letterHeight: string;
  letterBottom: string;
  envelopeTranslateY: number;
  envelopeOpacity: number;
  isFinal: boolean;
  letterProgress: number;
  flapProgress: number;
}

export function EnvelopeAnimation({
  rotation,
  flapRotation,
  letterHeight,
  letterBottom,
  envelopeTranslateY,
  envelopeOpacity,
  isFinal,
  letterProgress,
  flapProgress
}: EnvelopeAnimationProps) {
  return (
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
              <div style={{ fontSize: 'clamp(18px, 3.6vw, 36px)' }} className="italic"></div>
              <div style={{ fontSize: 'clamp(18px, 3.6vw, 36px)' }} className="italic -mt-1"></div>
              <div style={{ fontSize: 'clamp(16px, 2.7vw, 30px)' }} className="mt-2"> </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
