import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useNotification } from './NotificationSystem';
import './Dashboard.css';

interface User {
  id: string;
  name: string;
  email: string;
  isFirstTime: boolean;
  isAuthenticated: boolean;
}

interface DashboardProps {
  user: User;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
}

interface Analytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  ctr: number;
  conversionRate: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onToggleChat, isChatOpen }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    // Carregar dados do dashboard
    const loadDashboardData = async () => {
      try {
        // Simular chamada da API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Dados mock das campanhas
        const mockCampaigns: Campaign[] = [
          {
            id: '1',
            name: 'Campanha de Verão 2025',
            platform: 'Instagram',
            status: 'active',
            budget: 5000,
            spent: 3200,
            impressions: 45000,
            clicks: 1200,
            conversions: 85,
            createdAt: '2025-07-25'
          },
          {
            id: '2',
            name: 'Geração de Leads WhatsApp',
            platform: 'WhatsApp',
            status: 'active',
            budget: 2000,
            spent: 800,
            impressions: 12000,
            clicks: 450,
            conversions: 32,
            createdAt: '2025-07-28'
          },
          {
            id: '3',
            name: 'Awareness Facebook',
            platform: 'Facebook',
            status: 'paused',
            budget: 3000,
            spent: 2100,
            impressions: 28000,
            clicks: 890,
            conversions: 45,
            createdAt: '2025-07-20'
          }
        ];

        setCampaigns(mockCampaigns);

        // Calcular analytics
        const totalSpent = mockCampaigns.reduce((sum, c) => sum + c.spent, 0);
        const totalImpressions = mockCampaigns.reduce((sum, c) => sum + c.impressions, 0);
        const totalClicks = mockCampaigns.reduce((sum, c) => sum + c.clicks, 0);
        const totalConversions = mockCampaigns.reduce((sum, c) => sum + c.conversions, 0);

        setAnalytics({
          totalCampaigns: mockCampaigns.length,
          activeCampaigns: mockCampaigns.filter(c => c.status === 'active').length,
          totalSpent,
          totalImpressions,
          totalClicks,
          totalConversions,
          ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
          conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
        });
      } catch (error) {
        console.error('Falha ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'paused': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'draft': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return '📸';
      case 'facebook': return '👥';
      case 'whatsapp': return '💬';
      case 'email': return '📧';
      default: return '📱';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando seu painel de marketing...</p>
      </div>
    );
  }

  return (
    <div className={`dashboard ${isChatOpen ? 'chat-open' : ''}`}>
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">
              Bem-vindo de volta, <span className="text-gradient">{user.name}</span>
            </h1>
            <p className="dashboard-subtitle">
              Seu assistente de IA está pronto para ajudar você a criar campanhas incríveis
            </p>
          </div>
          <div className="header-right">
            <button 
              className="chat-toggle-btn"
              onClick={onToggleChat}
              title="Alternar Assistente de IA"
            >
              <span className="chat-icon">🤖</span>
              <span>Assistente IA</span>
              {!isChatOpen && <span className="pulse-dot"></span>}
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Visão Geral
          </button>
          <button
            className={`nav-tab ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            🚀 Campanhas
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <div className="overview-content">
            {analytics && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <h3>Total Campaigns</h3>
                    <p className="stat-number">{analytics.totalCampaigns}</p>
                    <span className="stat-label">{analytics.activeCampaigns} active</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <h3>Total Spent</h3>
                    <p className="stat-number">{formatCurrency(analytics.totalSpent)}</p>
                    <span className="stat-label">This month</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">👁️</div>
                  <div className="stat-content">
                    <h3>Impressions</h3>
                    <p className="stat-number">{formatNumber(analytics.totalImpressions)}</p>
                    <span className="stat-label">{analytics.ctr.toFixed(2)}% CTR</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🎉</div>
                  <div className="stat-content">
                    <h3>Conversions</h3>
                    <p className="stat-number">{formatNumber(analytics.totalConversions)}</p>
                    <span className="stat-label">{analytics.conversionRate.toFixed(2)}% rate</span>
                  </div>
                </div>
              </div>
            )}

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-cards">
                <button className="action-card" onClick={onToggleChat}>
                  <div className="action-icon">🚀</div>
                  <h3>Create New Campaign</h3>
                  <p>Tell our AI what you want to achieve and let it create the perfect campaign</p>
                </button>

                <button className="action-card" onClick={onToggleChat}>
                  <div className="action-icon">📊</div>
                  <h3>Analyze Performance</h3>
                  <p>Get AI-powered insights and recommendations for your campaigns</p>
                </button>

                <button className="action-card" onClick={onToggleChat}>
                  <div className="action-icon">🎯</div>
                  <h3>Optimize Campaigns</h3>
                  <p>Let AI automatically optimize your campaigns for better results</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="campaigns-content">
            <div className="campaigns-header">
              <h2>Your Campaigns</h2>
              <button className="btn-primary" onClick={onToggleChat}>
                + Create Campaign
              </button>
            </div>

            <div className="campaigns-list">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="campaign-card">
                  <div className="campaign-header">
                    <div className="campaign-info">
                      <span className="platform-icon">{getPlatformIcon(campaign.platform)}</span>
                      <div>
                        <h3>{campaign.name}</h3>
                        <p>{campaign.platform} • Created {new Date(campaign.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="campaign-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(campaign.status) }}
                      >
                        {campaign.status}
                      </span>
                    </div>
                  </div>

                  <div className="campaign-metrics">
                    <div className="metric">
                      <span className="metric-label">Budget</span>
                      <span className="metric-value">{formatCurrency(campaign.budget)}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Spent</span>
                      <span className="metric-value">{formatCurrency(campaign.spent)}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Impressions</span>
                      <span className="metric-value">{formatNumber(campaign.impressions)}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Conversions</span>
                      <span className="metric-value">{formatNumber(campaign.conversions)}</span>
                    </div>
                  </div>

                  <div className="campaign-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {((campaign.spent / campaign.budget) * 100).toFixed(1)}% of budget used
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-content">
            <h2>Performance Analytics</h2>
            <div className="analytics-placeholder">
              <div className="placeholder-icon">📈</div>
              <h3>Advanced Analytics Coming Soon</h3>
              <p>Our AI is preparing detailed analytics and insights for your campaigns.</p>
              <button className="btn-primary" onClick={onToggleChat}>
                Ask AI for Insights
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
