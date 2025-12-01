import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { RegisterForm } from './components/RegisterForm';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { ChristmasLetter } from './components/ChristmasLetter';

function App() {
  const [view, setView] = useState<'home' | 'register' | 'dashboard' | 'admin'>('home');
  const [participantId, setParticipantId] = useState<string | null>(localStorage.getItem('gift_participant_id'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setView('admin');
    } else if (participantId) {
      setView('dashboard');
    }
  }, [participantId]);

  return (
    <Layout>
      {view === 'home' && (
        <ChristmasLetter
          onRegister={() => setView('register')}
          onDashboard={() => setView('dashboard')}
        />
      )}

      {view === 'register' && (
        <RegisterForm onSuccess={(id) => {
          localStorage.setItem('gift_participant_id', id);
          setParticipantId(id);
          setView('dashboard');
        }} onBack={() => setView('home')} />
      )}

      {view === 'dashboard' && participantId && (
        <Dashboard participantId={participantId} onLogout={() => {
          localStorage.removeItem('gift_participant_id');
          setParticipantId(null);
          setView('home');
        }} />
      )}

      {view === 'admin' && <AdminPanel />}
    </Layout>
  );
}

export default App;
