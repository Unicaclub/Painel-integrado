import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AIChat from './components/AIChat';
import OnboardingFlow from './components/OnboardingFlow';
import AuthenticationModal from './components/AuthenticationModal';
import { NotificationProvider, useNotification } from './components/NotificationSystem';
import { apiService } from './services/api';
import './App.css';

interface User {
  id: string;
  name: string;
  email: string;
  isFirstTime: boolean;
  isAuthenticated: boolean;
}

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    // Verificar autenticação existente
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('painelIntegradoUser');
        const storedToken = localStorage.getItem('painelIntegradoToken');
        
        if (storedUser && storedToken) {
          try {
            // Verificar se o token ainda é válido
            const response = await apiService.verifyToken();
            
            if (response.success) {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              setShowAuth(false);
              if (userData.isFirstTime) {
                setShowOnboarding(true);
              }
              showSuccess('Bem-vindo de volta!', `Olá, ${userData.name}!`);
            } else {
              // Token inválido, limpar dados
              localStorage.removeItem('painelIntegradoUser');
              localStorage.removeItem('painelIntegradoToken');
            }
          } catch (error) {
            // Erro na verificação do token, limpar dados
            localStorage.removeItem('painelIntegradoUser');
            localStorage.removeItem('painelIntegradoToken');
            console.error('Token inválido:', error);
          }
        }
      } catch (error) {
        console.error('Falha na verificação de autenticação:', error);
        showError('Erro de Autenticação', 'Falha ao verificar credenciais. Faça login novamente.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [showError, showSuccess]);

  const handleAuthentication = (userData: User) => {
    setUser(userData);
    setShowAuth(false);
    localStorage.setItem('painelIntegradoUser', JSON.stringify(userData));
    
    if (userData.isFirstTime) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (user) {
      const updatedUser = { ...user, isFirstTime: false };
      setUser(updatedUser);
      localStorage.setItem('painelIntegradoUser', JSON.stringify(updatedUser));
    }
    setIsChatOpen(true);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Inicializando Painel Integrado...</h2>
        <p>Configurando seu assistente inteligente de marketing</p>
      </div>
    );
  }

  return (
    <div className="app">
      {showAuth && (
        <AuthenticationModal onAuthenticate={handleAuthentication} />
      )}
      
      {showOnboarding && user && (
        <OnboardingFlow 
          user={user} 
          onComplete={handleOnboardingComplete} 
        />
      )}
      
      {user && !showAuth && !showOnboarding && (
        <>
          <Dashboard 
            user={user} 
            onToggleChat={toggleChat}
            isChatOpen={isChatOpen}
          />
          
          <AIChat 
            user={user}
            isOpen={isChatOpen}
            onToggle={toggleChat}
          />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};

export default App;
