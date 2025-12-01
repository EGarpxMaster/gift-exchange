import { useEffect, useState } from 'react';
import { getParticipantById, getSettings, type Participant } from '../lib/supabase';
import { decrypt } from '../lib/encryption';
import { Gift, LogOut } from 'lucide-react';
import { isAfter } from 'date-fns';
import confetti from 'canvas-confetti';
import { ScrollEnvelope } from './ScrollEnvelope';

interface DashboardProps {
    participantId: string;
    onLogout: () => void;
}

// Contraseña por defecto (la misma que se usa en RegisterForm)
const DEFAULT_ENCRYPTION_PASSWORD = 'GiftExchange2025!';

export function Dashboard({ participantId, onLogout }: DashboardProps) {
    const [userData, setUserData] = useState<Participant | null>(null);
    const [matchData, setMatchData] = useState<Participant | null>(null);
    const [decryptedName, setDecryptedName] = useState<string>('');
    const [decryptedMatchName, setDecryptedMatchName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [namesRevealed, setNamesRevealed] = useState(false);

    // Reveal date
    const revealDate = new Date('2025-12-24T00:00:00');
    // Simulating date for demo
    const [simulatedDate, setSimulatedDate] = useState(new Date());
    const isDateRevealed = isAfter(simulatedDate, revealDate);

    useEffect(() => {
        if (participantId) {
            fetchData();
        }
    }, [participantId]);

    const fetchData = async () => {
        try {
            // Get settings
            const settings = await getSettings();
            setNamesRevealed(settings.names_revealed);

            // Get user
            const user = await getParticipantById(participantId);
            if (!user) throw new Error('Participant not found');
            
            setUserData(user);

            // Decrypt own name
            try {
                const decrypted = await decrypt(user.encrypted_name, DEFAULT_ENCRYPTION_PASSWORD);
                setDecryptedName(decrypted);
            } catch {
                setDecryptedName('[Nombre encriptado]');
            }

            // Get match if assigned
            if (user.assigned_to_id) {
                const match = await getParticipantById(user.assigned_to_id);
                if (match) {
                    setMatchData(match);
                    
                    // Decrypt match name if revealed
                    if (settings.names_revealed || isDateRevealed) {
                        try {
                            const decrypted = await decrypt(match.encrypted_name, DEFAULT_ENCRYPTION_PASSWORD);
                            setDecryptedMatchName(decrypted);
                        } catch {
                            setDecryptedMatchName('[Error al desencriptar]');
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReveal = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    const simulateReveal = async () => {
        setSimulatedDate(new Date('2025-12-25T00:00:00'));
        if (matchData) {
            try {
                const decrypted = await decrypt(matchData.encrypted_name, DEFAULT_ENCRYPTION_PASSWORD);
                setDecryptedMatchName(decrypted);
            } catch {
                setDecryptedMatchName('[Error al desencriptar]');
            }
        }
        handleReveal();
    };

    if (loading) return <div className="text-center py-12">Cargando...</div>;

    if (!userData) return <div className="text-center py-12">No se encontró información.</div>;

    const shouldRevealName = namesRevealed || isDateRevealed;

    return (
        <div className="relative min-h-[200vh]">
            <div className="sticky top-20 flex items-center justify-center px-4 py-8">
                <div className="max-w-2xl w-full space-y-8">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Hola, {decryptedName}</h2>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${userData.category === 'elite' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                }`}>
                                Categoría {userData.category === 'elite' ? 'Élite ($1,000)' : 'Diversión ($500)'}
                            </span>
                        </div>
                        <button onClick={onLogout} className="text-gray-500 hover:text-red-600">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Dev Tool */}
                    <div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-500 flex justify-between items-center">
                        <span>Fecha sim: {simulatedDate.toLocaleDateString()}</span>
                        <button
                            onClick={simulateReveal}
                            className="text-blue-600 hover:underline"
                        >
                            Simular 25 Dic (Revelar)
                        </button>
                    </div>

                    {matchData ? (
                        <div className="flex justify-center">
                            <ScrollEnvelope
                                recipientName={decryptedMatchName}
                                giftOptions={matchData.gift_options}
                                isNameRevealed={shouldRevealName}
                                onRevealComplete={handleReveal}
                            />
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-christmas-red text-center">
                            <p className="text-gray-500">Aún no se ha realizado el sorteo.</p>
                            <p className="text-sm mt-2 text-gray-400">El sorteo se realizará automáticamente después del 15 de diciembre.</p>
                        </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-2">Tus opciones de regalo:</h4>
                        <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                            {userData.gift_options.map((opt: string, i: number) => (
                                <li key={i}>{opt}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
