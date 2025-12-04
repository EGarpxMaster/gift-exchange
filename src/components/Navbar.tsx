interface NavbarProps {
  muted: boolean;
  onToggleMute: () => void;
}

export function Navbar({ muted, onToggleMute }: NavbarProps) {
  return (
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
            onClick={onToggleMute}
            className="ml-2 px-3 py-1 rounded-lg text-sm font-semibold"
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.4)'
            }}
          >
            {muted ? '🔇 Música' : '🔊 Música'}
          </button>
        </div>
      </div>
      {/* Borde inferior decorativo */}
      <div style={{
        height: '4px',
        background: 'repeating-linear-gradient(90deg, #27ae60 0px, #27ae60 20px, #fff 20px, #fff 40px, #c0392b 40px, #c0392b 60px)'
      }} />
    </div>
  );
}
