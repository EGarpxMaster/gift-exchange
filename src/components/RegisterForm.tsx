import { useState } from 'react';
import { createParticipant, checkNameExists } from '../lib/supabase';
import { encrypt } from '../lib/encryption';
import { Gift, User } from 'lucide-react';
import { isWithinInterval } from 'date-fns';

interface RegisterFormProps {
    onSuccess: (participantId: string) => void;
    onBack: () => void;
}

// Contraseña por defecto para encriptación (debe cambiarla el admin después)
const DEFAULT_ENCRYPTION_PASSWORD = 'GiftExchange2025!';

export function RegisterForm({ onSuccess, onBack }: RegisterFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'elite' as 'elite' | 'diversion',
        giftOptions: ['', '', '', '', '']
    });
    const [error, setError] = useState<string | null>(null);

    // Date validation
    const currentDate = new Date();
    const startDate = new Date('2025-12-05T00:00:00');
    const endDate = new Date('2025-12-15T23:59:59');

    // Simulation for testing
    const [simulatedDate, setSimulatedDate] = useState(currentDate);
    const isOpen = isWithinInterval(simulatedDate, { start: startDate, end: endDate });

    const handleGiftChange = (index: number, value: string) => {
        const newOptions = [...formData.giftOptions];
        newOptions[index] = value;
        setFormData({ ...formData, giftOptions: newOptions });
    };

    const addGiftOption = () => {
        setFormData({ ...formData, giftOptions: [...formData.giftOptions, ''] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate min 5 gifts
        const validGifts = formData.giftOptions.filter(g => g.trim().length > 0);
        if (validGifts.length < 5) {
            setError('Por favor agrega al menos 5 opciones de regalo.');
            return;
        }

        if (!formData.name.trim()) {
            setError('Por favor ingresa tu nombre completo.');
            return;
        }

        setLoading(true);

        try {
            // Encriptar el nombre
            const encryptedName = await encrypt(formData.name.trim(), DEFAULT_ENCRYPTION_PASSWORD);

            // Verificar si ya existe
            const exists = await checkNameExists(encryptedName);
            if (exists) {
                throw new Error('Ya existe un registro con este nombre.');
            }

            // Crear participante
            const participant = await createParticipant(
                encryptedName,
                formData.category,
                validGifts
            );

            onSuccess(participant.id);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error al registrar');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl border-t-4 border-christmas-green animate-fade-in">
            <div className="mb-6 text-center">
                <div className="text-4xl mb-3 animate-bounce-slow">🎁</div>
                <h2 className="text-2xl font-display text-christmas-red">Registro de Participante</h2>
                <p className="text-sm text-gray-500">Completa tus datos para el sorteo</p>
            </div>

            {/* Dev Tool for Date Simulation */}
            <div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-500 flex justify-between items-center">
                <span>Fecha actual: {simulatedDate.toLocaleDateString()}</span>
                <button
                    type="button"
                    onClick={() => setSimulatedDate(new Date('2025-12-10T12:00:00'))}
                    className="text-blue-600 hover:underline"
                >
                    Simular 10 Dic (Abierto)
                </button>
            </div>

            {!isOpen ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Registro Cerrado</h3>
                    <p className="text-gray-600">
                        Las inscripciones solo están disponibles del 05 al 15 de Diciembre.
                    </p>
                    <button onClick={onBack} className="mt-6 text-christmas-red hover:underline">Volver al inicio</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-green focus:border-transparent"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej. Juan Pérez"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Tu nombre será encriptado para mantener el secreto hasta el 24 de diciembre
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, category: 'elite' })}
                                className={`p-4 border rounded-lg text-center transition-all ${formData.category === 'elite'
                                    ? 'border-christmas-gold bg-yellow-50 ring-2 ring-christmas-gold'
                                    : 'border-gray-200 hover:border-christmas-gold'
                                    }`}
                            >
                                <div className="font-bold text-christmas-dark">Élite</div>
                                <div className="text-sm text-gray-500">$1,000 MXN</div>
                                <div className="text-xs text-christmas-gold mt-1">Adultos</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, category: 'diversion' })}
                                className={`p-4 border rounded-lg text-center transition-all ${formData.category === 'diversion'
                                    ? 'border-christmas-green bg-green-50 ring-2 ring-christmas-green'
                                    : 'border-gray-200 hover:border-christmas-green'
                                    }`}
                            >
                                <div className="font-bold text-christmas-dark">Diversión</div>
                                <div className="text-sm text-gray-500">$500 MXN</div>
                                <div className="text-xs text-christmas-green mt-1">Niños</div>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opciones de Regalo (Mínimo 5)
                        </label>
                        <div className="space-y-2">
                            {formData.giftOptions.map((gift, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            required={index < 5}
                                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-christmas-red focus:border-transparent text-sm"
                                            value={gift}
                                            onChange={e => handleGiftChange(index, e.target.value)}
                                            placeholder={`Opción ${index + 1}`}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addGiftOption}
                                className="text-sm text-christmas-green hover:text-green-700 font-medium flex items-center gap-1"
                            >
                                + Agregar otra opción
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 px-4 bg-christmas-red text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-bold shadow-md"
                        >
                            {loading ? 'Registrando...' : 'Confirmar Registro'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
