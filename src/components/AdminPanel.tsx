import { useState, useEffect } from 'react';
import { getParticipants, getSettings, updateSettings, updateParticipantAssignment } from '../lib/supabase';
import { performSorteo, validateAssignments } from '../lib/sorteo';
import { decrypt, hashPassword, verifyPassword } from '../lib/encryption';
import { Shuffle, CheckCircle, AlertTriangle, Users, Lock, Eye, Key } from 'lucide-react';

const DEFAULT_ENCRYPTION_PASSWORD = 'GiftExchange2025!';

export function AdminPanel() {
    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(true);
    const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [stats, setStats] = useState({ total: 0, elite: 0, diversion: 0, sorteoCompleted: false, namesRevealed: false });
    const [participants, setParticipants] = useState<any[]>([]);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [decryptedNames, setDecryptedNames] = useState<Map<string, string>>(new Map());
    const [showNames, setShowNames] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const parts = await getParticipants();
            const settings = await getSettings();
            
            setParticipants(parts);
            setStats({
                total: parts.length,
                elite: parts.filter(p => p.category === 'elite').length,
                diversion: parts.filter(p => p.category === 'diversion').length,
                sorteoCompleted: settings.sorteo_completed,
                namesRevealed: settings.names_revealed
            });
        } catch (err) {
            console.error('Error loading stats:', err);
        } finally {
            setLoadingStats(false);
        }
    };

    const runDraw = async () => {
        if (!confirm('¿Estás seguro de ejecutar el sorteo? Esto asignará a todos los participantes.')) return;

        setLoading(true);
        setStatus({ message: 'Obteniendo participantes...', type: 'info' });

        try {
            const parts = await getParticipants();
            
            if (parts.length < 2) {
                throw new Error('No hay suficientes participantes para realizar el sorteo (mínimo 2).');
            }

            // Separar por categoría
            const elite = parts.filter(p => p.category === 'elite');
            const diversion = parts.filter(p => p.category === 'diversion');

            if (elite.length === 1) {
                throw new Error('Solo hay 1 participante en categoría Élite. Se necesitan al menos 2.');
            }
            if (diversion.length === 1) {
                throw new Error('Solo hay 1 participante en categoría Diversión. Se necesitan al menos 2.');
            }

            // Ejecutar sorteo
            setStatus({ message: 'Ejecutando algoritmo de sorteo...', type: 'info' });
            const assignments = performSorteo(
                elite.map(p => ({ id: p.id, category: p.category })),
                diversion.map(p => ({ id: p.id, category: p.category }))
            );

            // Validar asignaciones
            const validation = validateAssignments(
                parts.map(p => ({ id: p.id, category: p.category })),
                assignments
            );

            if (!validation.valid) {
                throw new Error(`Validación falló: ${validation.errors.join(', ')}`);
            }

            // Guardar en BD
            setStatus({ message: `Guardando ${assignments.size} asignaciones...`, type: 'info' });

            for (const [participantId, assignedToId] of assignments.entries()) {
                await updateParticipantAssignment(participantId, assignedToId);
            }

            // Marcar sorteo como completado
            await updateSettings({ sorteo_completed: true });

            setStatus({ message: '¡Sorteo realizado con éxito!', type: 'success' });
            await loadStats();

        } catch (err: any) {
            setStatus({ message: err.message || 'Error en el sorteo', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRevealNames = async () => {
        if (!confirm('¿Revelar los nombres ahora? Todos los participantes verán quién les tocó.')) return;

        try {
            await updateSettings({ names_revealed: true });
            setStatus({ message: '¡Nombres revelados!', type: 'success' });
            await loadStats();
        } catch (err: any) {
            setStatus({ message: err.message || 'Error al revelar nombres', type: 'error' });
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        try {
            // Verificar contraseña actual
            const settings = await getSettings();
            const isValid = await verifyPassword(currentPassword, settings.encryption_password_hash);
            
            if (!isValid && currentPassword !== DEFAULT_ENCRYPTION_PASSWORD) {
                alert('Contraseña actual incorrecta');
                return;
            }

            // Guardar nueva contraseña
            const newHash = await hashPassword(newPassword);
            await updateSettings({ encryption_password_hash: newHash });

            alert('Contraseña de encriptación actualizada. IMPORTANTE: Guarda esta contraseña, se necesitará para desencriptar los nombres.');
            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
        } catch (err: any) {
            alert('Error al cambiar contraseña: ' + err.message);
        }
    };

    const handleDecryptNames = async () => {
        const password = prompt('Ingresa la contraseña de encriptación:');
        if (!password) return;

        try {
            const newDecrypted = new Map<string, string>();
            
            for (const participant of participants) {
                try {
                    const decrypted = await decrypt(participant.encrypted_name, password);
                    newDecrypted.set(participant.id, decrypted);
                } catch {
                    newDecrypted.set(participant.id, '[Error al desencriptar]');
                }
            }
            
            setDecryptedNames(newDecrypted);
            setShowNames(true);
            setStatus({ message: 'Nombres desencriptados exitosamente', type: 'success' });
        } catch (err: any) {
            setStatus({ message: 'Error al desencriptar: ' + err.message, type: 'error' });
        }
    };

    if (loadingStats) {
        return <div className="text-center py-12">Cargando panel...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-gray-800">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Shuffle className="w-6 h-6" />
                    Panel de Emmanuel (Administrador)
                </h2>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                        <div className="text-sm text-blue-700">Total</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-900">{stats.elite}</div>
                        <div className="text-sm text-yellow-700">Élite</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-900">{stats.diversion}</div>
                        <div className="text-sm text-green-700">Diversión</div>
                    </div>
                </div>

                {/* Estado */}
                <div className="flex gap-4 mb-6">
                    <div className={`flex-1 p-3 rounded ${stats.sorteoCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Sorteo: {stats.sorteoCompleted ? 'Completado' : 'Pendiente'}
                    </div>
                    <div className={`flex-1 p-3 rounded ${stats.namesRevealed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        <Eye className="w-4 h-4 inline mr-2" />
                        Nombres: {stats.namesRevealed ? 'Revelados' : 'Ocultos'}
                    </div>
                </div>

                {status && (
                    <div className={`p-4 rounded mb-6 flex items-center gap-2 ${
                        status.type === 'success' ? 'bg-green-100 text-green-800' :
                        status.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        {status.message}
                    </div>
                )}

                {/* Acciones */}
                <div className="space-y-3">
                    <button
                        onClick={runDraw}
                        disabled={loading || stats.sorteoCompleted}
                        className="w-full py-3 bg-christmas-red text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg flex justify-center items-center gap-2"
                    >
                        <Shuffle className="w-5 h-5" />
                        {loading ? 'Procesando...' : stats.sorteoCompleted ? 'Sorteo Ya Completado' : 'Ejecutar Sorteo (Rifa)'}
                    </button>

                    <button
                        onClick={handleRevealNames}
                        disabled={!stats.sorteoCompleted || stats.namesRevealed}
                        className="w-full py-3 bg-christmas-green text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg flex justify-center items-center gap-2"
                    >
                        <Eye className="w-5 h-5" />
                        {stats.namesRevealed ? 'Nombres Ya Revelados' : 'Revelar Nombres'}
                    </button>

                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full py-3 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-all shadow-lg flex justify-center items-center gap-2"
                    >
                        <Key className="w-5 h-5" />
                        Cambiar Contraseña de Encriptación
                    </button>

                    <button
                        onClick={handleDecryptNames}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg flex justify-center items-center gap-2"
                    >
                        <Lock className="w-5 h-5" />
                        Ver Nombres Desencriptados
                    </button>
                </div>
            </div>

            {/* Lista de participantes */}
            {showNames && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Participantes Registrados</h3>
                    <div className="space-y-2">
                        {participants.map(p => (
                            <div key={p.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                                <div>
                                    <div className="font-medium">{decryptedNames.get(p.id) || p.encrypted_name}</div>
                                    <div className="text-sm text-gray-600">
                                        {p.category === 'elite' ? '👑 Élite' : '🎈 Diversión'} - {p.gift_options.length} opciones
                                    </div>
                                </div>
                                {p.assigned_to_id && (
                                    <div className="text-xs text-green-600">✓ Asignado</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal cambiar contraseña */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Cambiar Contraseña de Encriptación</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Contraseña Actual</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Contraseña actual"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Mínimo 8 caracteres"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 py-2 border rounded hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    className="flex-1 py-2 bg-christmas-red text-white rounded hover:bg-red-700"
                                >
                                    Cambiar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
