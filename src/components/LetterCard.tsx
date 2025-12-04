interface LetterCardProps {
  onRegister: () => void;
}

export function LetterCard({ onRegister }: LetterCardProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 overflow-y-auto pt-20 pb-8">
      <div
        className="bg-white shadow-2xl my-8 mx-4"
        style={{
          width: 'min(95vw, 700px)',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          borderRadius: '12px',
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto'
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

          {/* Categorías */}
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

          {/* Sistema de Emmanuel */}
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

          {/* Fechas */}
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

          {/* Privacidad */}
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

          {/* CTA */}
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
              onClick={onRegister}
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
  );
}
