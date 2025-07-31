# Painel Integrado - Sistema de Marketing com IA

Um sistema completo de automação de marketing com inteligência artificial, integrando WhatsApp, Instagram, Facebook e Email Marketing.

## 🚀 Funcionalidades

### Frontend (React + TypeScript)
- **Dashboard Interativo**: Visão geral das campanhas e métricas
- **Chat com IA**: Assistente inteligente para criação e otimização de campanhas
- **Autenticação Segura**: Sistema de login/registro com JWT
- **Notificações em Tempo Real**: Feedback visual para todas as ações
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Modo Demo**: Teste todas as funcionalidades sem configuração

### Backend (Node.js + TypeScript)
- **API RESTful**: Endpoints completos para todas as funcionalidades
- **Integração com IA**: OpenAI GPT para assistente inteligente
- **Webhooks**: Integração com WhatsApp (Z-API), Meta (Facebook/Instagram) e Email (SendGrid)
- **Analytics Avançado**: Métricas detalhadas de performance
- **Banco de Dados**: MongoDB para persistência de dados
- **Cache**: Redis para otimização de performance
- **Logs Estruturados**: Sistema completo de logging

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18 com TypeScript
- Axios para requisições HTTP
- CSS3 com animações e glassmorphism
- Sistema de notificações customizado
- Responsive design

### Backend
- Node.js com Express e TypeScript
- MongoDB com Mongoose
- Redis para cache
- OpenAI API para IA
- Winston para logs
- Helmet para segurança
- Rate limiting e CORS

## 📋 Pré-requisitos

- Node.js 18+ 
- MongoDB 4.4+
- Redis 6+
- Conta OpenAI (para IA)
- Conta Z-API (para WhatsApp)
- Conta Meta Developer (para Facebook/Instagram)
- Conta SendGrid (para Email)

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd ai-marketing-automation
```

### 2. Instale as dependências

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ..
npm install
```

### 3. Configure as variáveis de ambiente

#### Backend (.env)
```env
# Configuração do Servidor
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/painel-integrado
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sua_openai_api_key_aqui

# Z-API (WhatsApp)
ZAPI_INSTANCE_ID=seu_instance_id
ZAPI_TOKEN=seu_token
ZAPI_BASE_URL=https://api.z-api.io/instances

# Meta (Facebook/Instagram)
META_APP_ID=seu_app_id
META_APP_SECRET=seu_app_secret
META_ACCESS_TOKEN=seu_access_token
META_VERIFY_TOKEN=seu_verify_token
INSTAGRAM_BUSINESS_ID=seu_instagram_business_id
META_PAGE_ID=seu_page_id

# SendGrid (Email)
SENDGRID_API_KEY=sua_sendgrid_api_key
FROM_EMAIL=noreply@seudominio.com
FROM_NAME=Painel Integrado

# CORS
CORS_ORIGIN=http://localhost:3000

# Webhook URLs
WEBHOOK_BASE_URL=https://seudominio.com/api/webhook
```

#### Frontend (.env)
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api

# App Configuration
REACT_APP_APP_NAME=Painel Integrado
REACT_APP_VERSION=1.0.0

# Socket.IO Configuration
REACT_APP_SOCKET_URL=http://localhost:3001

# Development Configuration
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=info
```

### 4. Inicie os serviços

#### MongoDB
```bash
mongod
```

#### Redis
```bash
redis-server
```

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
npm start
```

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/register` - Registro de novo usuário
- `GET /api/auth/verify` - Verificar token JWT
- `POST /api/auth/logout` - Logout do usuário

### Agentes de IA
- `GET /api/ai-agent` - Listar agentes disponíveis
- `GET /api/ai-agent/:agentName/capabilities` - Capacidades do agente
- `POST /api/ai-agent/:agentName/message` - Enviar mensagem para agente específico
- `POST /api/ai-agent/select` - Selecionar melhor agente para mensagem
- `POST /api/ai-agent/chat` - Chat com seleção automática de agente
- `POST /api/ai-agent/test` - Testar agentes
- `GET /api/ai-agent/stats` - Estatísticas dos agentes

### Campanhas
- `GET /api/campaigns` - Listar todas as campanhas
- `GET /api/campaigns/:id` - Obter campanha específica
- `POST /api/campaigns` - Criar nova campanha
- `PUT /api/campaigns/:id` - Atualizar campanha
- `PATCH /api/campaigns/:id/status` - Alterar status da campanha
- `DELETE /api/campaigns/:id` - Deletar campanha
- `GET /api/campaigns/:id/metrics` - Métricas da campanha

### Analytics
- `GET /api/analytics/dashboard` - Analytics do dashboard
- `GET /api/analytics/platform/:platform` - Analytics por plataforma
- `GET /api/analytics/conversions` - Relatório de conversões
- `GET /api/analytics/ai-agents` - Analytics dos agentes de IA
- `POST /api/analytics/report` - Gerar relatório personalizado

### Webhooks
- `POST /api/webhook/whatsapp` - Webhook do WhatsApp
- `GET /api/webhook/meta` - Verificação do webhook Meta
- `POST /api/webhook/meta` - Webhook do Meta (Facebook/Instagram)
- `POST /api/webhook/email` - Webhook do Email
- `POST /api/webhook/test` - Testar webhooks
- `GET /api/webhook/status` - Status dos serviços

### Saúde da API
- `GET /api/health` - Health check da API

## 🎯 Como Usar

### 1. Acesso Inicial
1. Acesse `http://localhost:3000`
2. Faça login ou registre uma nova conta
3. Use a conta demo para testar: `demo@painelintegrado.com` / `demo123`

### 2. Dashboard
- **Visão Geral**: Métricas principais das campanhas
- **Campanhas**: Lista e gerenciamento de campanhas
- **Analytics**: Relatórios detalhados de performance

### 3. Assistente de IA
- Clique no botão "Assistente IA" para abrir o chat
- Use as ações rápidas ou digite suas perguntas
- O assistente pode ajudar com:
  - Criação de campanhas
  - Análise de performance
  - Otimização de orçamento
  - Ideias de conteúdo

### 4. Integração com Plataformas

#### WhatsApp (Z-API)
1. Configure as credenciais no `.env`
2. Configure o webhook: `POST /api/webhook/whatsapp`
3. Teste a integração: `POST /api/webhook/test`

#### Meta (Facebook/Instagram)
1. Configure as credenciais no `.env`
2. Configure o webhook: `GET/POST /api/webhook/meta`
3. Teste a integração: `POST /api/webhook/test`

#### Email (SendGrid)
1. Configure as credenciais no `.env`
2. Configure o webhook: `POST /api/webhook/email`
3. Teste a integração: `POST /api/webhook/test`

## 🔒 Segurança

- **JWT Authentication**: Tokens seguros para autenticação
- **Rate Limiting**: Proteção contra ataques de força bruta
- **CORS**: Configuração adequada para requisições cross-origin
- **Helmet**: Headers de segurança HTTP
- **Validação de Dados**: Validação rigorosa de entrada
- **Logs de Segurança**: Monitoramento de atividades suspeitas

## 📊 Monitoramento

### Logs
- Logs estruturados com Winston
- Diferentes níveis: error, warn, info, debug
- Rotação automática de arquivos
- Logs de webhook e atividades de IA

### Health Check
- Endpoint `/api/health` para monitoramento
- Status de conexões (MongoDB, Redis)
- Métricas de uptime e performance

## 🚀 Deploy em Produção

### 1. Variáveis de Ambiente
- Configure todas as variáveis para produção
- Use secrets seguros para APIs
- Configure URLs de webhook públicas

### 2. Banco de Dados
- Use MongoDB Atlas ou instância dedicada
- Configure Redis em cluster se necessário
- Implemente backups regulares

### 3. Servidor
- Use PM2 para gerenciamento de processos
- Configure proxy reverso (Nginx)
- Implemente SSL/TLS
- Configure monitoramento (New Relic, DataDog)

### 4. Frontend
- Build de produção: `npm run build`
- Sirva arquivos estáticos via CDN
- Configure cache adequado

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte técnico ou dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da API
- Verifique os logs para debugging

## 🔄 Atualizações

### v1.0.0
- Sistema completo de marketing com IA
- Integração com WhatsApp, Instagram, Facebook e Email
- Dashboard interativo e responsivo
- Chat com assistente de IA
- Sistema de notificações
- Analytics avançado
- Webhooks para todas as plataformas
- Documentação completa
