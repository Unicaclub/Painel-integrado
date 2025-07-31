// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Adicionar token de autenticação
    const token = localStorage.getItem('painelIntegradoToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      (headers as any).Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Verificar se o token expirou
      if (response.status === 401) {
        localStorage.removeItem('painelIntegradoToken');
        localStorage.removeItem('painelIntegradoUser');
        window.location.reload();
        throw new Error('Token expirado');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Métodos de autenticação
  async login(email: string, password: string) {
    return await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async verifyToken() {
    return await this.request('/auth/verify');
  }

  async logout() {
    return await this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Métodos de campanhas
  async getCampaigns() {
    return await this.request('/campaigns');
  }

  async getCampaign(id: string) {
    return await this.request(`/campaigns/${id}`);
  }

  async createCampaign(campaignData: any) {
    return await this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async updateCampaign(id: string, campaignData: any) {
    return await this.request(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    });
  }

  async updateCampaignStatus(id: string, status: string) {
    return await this.request(`/campaigns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteCampaign(id: string) {
    return await this.request(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  async getCampaignMetrics(id: string, period: string = '7d') {
    return await this.request(`/campaigns/${id}/metrics?period=${period}`);
  }

  // Métodos de analytics
  async getDashboardAnalytics(period: string = '30d') {
    return await this.request(`/analytics/dashboard?period=${period}`);
  }

  async getPlatformAnalytics(platform: string, period: string = '30d') {
    return await this.request(`/analytics/platform/${platform}?period=${period}`);
  }

  async getConversionsReport(period: string = '30d') {
    return await this.request(`/analytics/conversions?period=${period}`);
  }

  async getAiAgentsAnalytics(period: string = '30d') {
    return await this.request(`/analytics/ai-agents?period=${period}`);
  }

  async generateCustomReport(reportData: any) {
    return await this.request('/analytics/report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // Métodos de agentes de IA
  async getAiAgents() {
    return await this.request('/ai-agent');
  }

  async getAgentCapabilities(agentName: string) {
    return await this.request(`/ai-agent/${agentName}/capabilities`);
  }

  async sendMessageToAgent(agentName: string, message: string, context?: any, conversationHistory?: any[]) {
    return await this.request(`/ai-agent/${agentName}/message`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        context,
        conversationHistory
      }),
    });
  }

  async selectBestAgent(message: string, context?: any) {
    return await this.request('/ai-agent/select', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async chatWithAi(message: string, context?: any, conversationHistory?: any[]) {
    return await this.request('/ai-agent/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context,
        conversationHistory
      }),
    });
  }

  async testAiAgents(messages: string[]) {
    return await this.request('/ai-agent/test', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  async getAiAgentsStats() {
    return await this.request('/ai-agent/stats');
  }

  // Métodos de webhook
  async testWebhook(platform: string, message: string, recipient?: string) {
    return await this.request('/webhook/test', {
      method: 'POST',
      body: JSON.stringify({
        platform,
        message,
        recipient
      }),
    });
  }

  async getWebhookStatus() {
    return await this.request('/webhook/status');
  }

  // Método para verificar saúde da API
  async healthCheck() {
    return await this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
