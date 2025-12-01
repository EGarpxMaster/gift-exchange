import type { ReactNode } from 'react';
import { Gift } from 'lucide-react';
import { SnowEffect } from './SnowEffect';

export function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-christmas-cream text-christmas-dark font-sans selection:bg-christmas-red selection:text-white overflow-x-hidden">
            {/* Efecto de nieve */}
            <SnowEffect />
            
            {/* Header */}
            <header className="bg-christmas-red text-white py-6 shadow-lg sticky top-0 z-50 border-b-4 border-christmas-gold">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Gift className="w-8 h-8 text-christmas-gold animate-wiggle" />
                        <div>
                            <h1 className="text-2xl font-display font-bold tracking-wider">Intercambio de Regalos 2025</h1>
                            <p className="text-xs text-christmas-gold opacity-90">¡Bienvenida al Año Nuevo 2026!</p>
                        </div>
                    </div>
                    <div className="text-sm font-medium opacity-90 animate-pulse-slow">
                        🎄 ¡Felices Fiestas!
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-christmas-green text-white py-8 mt-12 border-t-4 border-christmas-gold">
                <div className="container mx-auto px-4 text-center space-y-3">
                    <p className="font-display text-2xl mb-2">🎁 Nos vemos el 24 de Diciembre 🎁</p>
                    <p className="text-sm opacity-90">💻 El Secreto Mejor Guardado: El Sistema de Emmanuel</p>
                    <div className="text-xs opacity-75 space-y-1 mt-4">
                        <p>📅 Registro: 5-15 Diciembre | Sorteo: 15 Diciembre | Revelación: 24 Diciembre</p>
                    </div>
                </div>
            </footer>

            {/* Decorative Background */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle, #D42426 1px, transparent 1px)',
                backgroundSize: '30px 30px'
            }}></div>
        </div>
    );
}
