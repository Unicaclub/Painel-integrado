import React, { useState } from 'react';
import { apiService } from '../services/api';
import { useNotification } from './NotificationSystem';
import './AuthenticationModal.css';

interface User {
  id: string;
  name: string;
  email: string;
  isFirstTime: boolean;
  isAuthenticated: boolean;
}

interface AuthenticationModalProps {
  onAuthenticate: (user: User) => void;
}

const AuthenticationModal: React.FC<AuthenticationModalProps> = ({ onAuthenticate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError, showInfo } = useNotification();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email e senha são obrigatórios');
      return false;
    }

    if (!isLogin && !formData.name) {
      setError('Nome é obrigatório para o cadastro');
      return false;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      let response;
      
      if (isLogin) {
        response = await apiService.login(formData.email, formData.password);
      } else {
        response = await apiService.register(formData.name, formData.email, formData.password);
      }

      if (response.success) {
        // Armazenar token
        localStorage.setItem('painelIntegradoToken', response.data.token);
        
        // Mostrar notificação de sucesso
        showSuccess(
          isLogin ? 'Login realizado!' : 'Conta criada!',
          response.data.message || (isLogin ? 'Bem-vindo de volta!' : 'Sua conta foi criada com sucesso!')
        );

        // Autenticar usuário
        onAuthenticate(response.data.user);
      } else {
        setError(response.error || 'Erro na autenticação');
        showError('Erro de Autenticação', response.error || 'Falha na autenticação. Tente novamente.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro interno do servidor. Tente novamente.';
      setError(errorMessage);
      showError('Erro de Conexão', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const response = await apiService.login('demo@painelintegrado.com', 'demo123');
      
      if (response.success) {
        localStorage.setItem('painelIntegradoToken', response.data.token);
        showSuccess('Modo Demo Ativado', 'Bem-vindo ao modo demonstração!');
        onAuthenticate(response.data.user);
      } else {
        // Fallback para usuário demo offline
        const demoUser: User = {
          id: 'demo-user',
          name: 'Usuário Demo',
          email: 'demo@painelintegrado.com',
          isFirstTime: true,
          isAuthenticated: true
        };
        showInfo('Modo Demo Offline', 'Usando dados de demonstração locais.');
        onAuthenticate(demoUser);
      }
    } catch (error) {
      // Fallback para usuário demo offline
      const demoUser: User = {
        id: 'demo-user',
        name: 'Usuário Demo',
        email: 'demo@painelintegrado.com',
        isFirstTime: true,
        isAuthenticated: true
      };
      showInfo('Modo Demo Offline', 'Usando dados de demonstração locais.');
      onAuthenticate(demoUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-header">
          <h1 className="auth-title">
            <span className="text-gradient">Painel</span>
            <br />
            Integrado
          </h1>
          <p className="auth-subtitle">
            Seu assistente inteligente de marketing com IA
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Entrar
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Nome Completo"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              name="email"
                placeholder="Endereço de Email"
              value={formData.email}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
                placeholder="Senha"
              value={formData.password}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar Senha"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">
                <span className="spinner"></span>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

          <button
            onClick={handleDemoLogin}
            className="btn-secondary demo-button"
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Testar Conta Demo'}
          </button>

        <div className="auth-footer">
          <p className="text-white-60">
            {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
            <button
              type="button"
              className="auth-link"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Cadastre-se' : 'Entre'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationModal;
