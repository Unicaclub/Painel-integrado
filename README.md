# 🚀 Painel Integrado - Sistema Fullstack de Marketing com IA

Um sistema completo de automação de marketing com agentes de IA, integração com WhatsApp, Meta (Facebook/Instagram) e Email, desenvolvido com Node.js, TypeScript, React e OpenAI.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características](#características)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Agentes de IA](#agentes-de-ia)
- [Integrações](#integrações)
- [Contribuição](#contribuição)

## 🎯 Visão Geral

O Painel Integrado é uma plataforma completa de automação de marketing que utiliza inteligência artificial para gerenciar campanhas, responder mensagens automaticamente e otimizar resultados em múltiplas plataformas.

### Principais Funcionalidades

- **🤖 Agentes de IA Especializados**: Vendedor, Suporte e Promoter
- **💬 Integração WhatsApp**: Via Z-API com respostas automáticas
- **📱 Meta Integration**: Facebook e Instagram Messenger
- **📧 Email Marketing**: Integração com SendGrid
- **📊 Dashboard Completo**: Analytics em tempo real
- **🔄 Webhooks**: Processamento automático de mensagens
- **🎨 Interface Moderna**: React com TypeScript

## ✨ Características

### Backend
- **Arquitetura Modular**: Separação clara de responsabilidades
- **API RESTful**: Endpoints bem documentados
- **Agentes de IA**: Sistema inteligente de roteamento de mensagens
- **Webhooks**: Processamento em tempo real
- **Cache Redis**: Performance otimizada
- **Logs Estruturados**: Winston para monitoramento
- **Rate Limiting**: Proteção contra abuso
- **Validação**: Joi para validação de dados

### Frontend
- **React + TypeScript**: Interface moderna e tipada
- **Dashboard Responsivo**: Visualização de dados em tempo real
- **Chat com IA**: Interface conversacional
- **Componentes Reutilizáveis**: Arquitetura modular
- **Localização**: Totalmente em português brasileiro

## 🏗️ Arquitetura

```
Painel-Integrado/
├── backend/                    # API Node.js + TypeScript
│   ├── src/
│   │   ├── config/            # Configurações (DB, Redis)
│   │   ├── controllers/       # Controladores da API
│   │   ├── middleware/        # Middlewares (auth, error)
│   │   ├── models/           # Modelos de dados
│   │   ├── routes/           # Rotas da API
│   │   ├── services/         # Serviços (IA, WhatsApp, Meta)
│   │   └── utils/            # Utilitários (logger)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── ai-marketing-automation/   # Frontend React
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── services/         # Serviços do frontend
│   │   └── utils/           # Utilitários
│   └── package.json
└── README.md
```

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Tipagem estática
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Redis** - Cache e sessões
- **OpenAI** - Inteligência artificial
- **Socket.IO** - Comunicação em tempo real
- **Winston** - Sistema de logs
- **Joi** - Validação de dados

### Frontend
- **React** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **CSS3** - Estilização moderna
- **Axios** - Cliente HTTP

### Integrações
- **Z-API** - WhatsApp Business API
- **Meta Graph API** - Facebook e Instagram
- **SendGrid** - Email marketing
- **OpenAI GPT-4** - Agentes de IA

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- MongoDB
- Redis
- Conta OpenAI
- Conta Z-API (WhatsApp)
- Conta Meta Developer (Facebook/Instagram)
- Conta SendGrid (Email)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/painel-integrado.git
cd painel-integrado
```

### 2. Instale as dependências do backend
```bash
cd backend
npm install
```

### 3. Instale as dependências do frontend
```bash
cd ../ai-marketing-automation
npm install
```

## ⚙️ Configuração

### 1. Configure o Backend

Copie o arquivo de exemplo e configure as variáveis:
```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Servidor
NODE_ENV=development
PORT=3001

# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/painel-integrado
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sua_chave_openai_aqui

# Z-API (WhatsApp)
ZAPI_INSTANCE_ID=sua_instance_id
ZAPI_TOKEN=seu_token_zapi

# Meta (Facebook/Instagram)
META_ACCESS_TOKEN=seu_token_meta
META_VERIFY_TOKEN=seu_verify_token
INSTAGRAM_BUSINESS_ID=seu_instagram_business_id
META_PAGE_ID=seu_page_id

# SendGrid (Email)
SENDGRID_API_KEY=sua_chave_sendgrid
```

### 2. Configure os Webhooks

#### WhatsApp (Z-API)
Configure o webhook para: `https://seudominio.com/api/webhook/whatsapp`

#### Meta (Facebook/Instagram)
Configure o webhook para: `https://seudominio.com/api/webhook/meta`

#### SendGrid (Email)
Configure o webhook para: `https://seudominio.com/api/webhook/email`

## 🚀 Uso

### 1. Inicie o Backend
```bash
cd backend
npm run dev
```

### 2. Inicie o Frontend
```bash
cd ai-marketing-automation
npm start
```

### 3. Acesse a aplicação
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/register` - Registro de usuário
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Logout

### Agentes de IA
- `GET /api/ai-agent` - Listar agentes disponíveis
- `POST /api/ai-agent/chat` - Chat com seleção automática de agente
- `POST /api/ai-agent/:agentName/message` - Mensagem para agente específico
- `GET /api/ai-agent/:agentName/capabilities` - Capacidades do agente
- `GET /api/ai-agent/stats` - Estatísticas dos agentes

### Campanhas
- `GET /api/campaigns` - Listar campanhas
- `POST /api/campaigns` - Criar campanha
- `GET /api/campaigns/:id` - Obter campanha específica
- `PUT /api/campaigns/:id` - Atualizar campanha
- `DELETE /api/campaigns/:id` - Deletar campanha
- `GET /api/campaigns/:id/metrics` - Métricas da campanha

### Analytics
- `GET /api/analytics/dashboard` - Dashboard principal
- `GET /api/analytics/platform/:platform` - Analytics por plataforma
- `GET /api/analytics/conversions` - Relatório de conversões
- `GET /api/analytics/ai-agents` - Analytics dos agentes de IA
- `POST /api/analytics/report` - Gerar relatório personalizado

### Webhooks
- `POST /api/webhook/whatsapp` - Webhook do WhatsApp
- `GET/POST /api/webhook/meta` - Webhook do Meta
- `POST /api/webhook/email` - Webhook do Email
- `POST /api/webhook/test` - Testar envio de mensagens
- `GET /api/webhook/status` - Status dos serviços

### Usuários
- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/stats` - Estatísticas do usuário

## 🤖 Agentes de IA

### 1. Agente Vendedor
**Especialidade**: Vendas e conversão
- Qualificação de leads
- Estratégias de conversão
- Análise de métricas de vendas
- Criação de argumentos de venda
- Sequências de follow-up

### 2. Agente Suporte
**Especialidade**: Atendimento ao cliente
- Resolução de problemas técnicos
- Orientação de uso da plataforma
- Criação de tutoriais
- Gestão de expectativas
- Escalação de problemas

### 3. Agente Promoter
**Especialidade**: Marketing de conteúdo
- Criação de conteúdo para redes sociais
- Estratégias de engajamento
- Análise de tendências
- Otimização de alcance
- Growth hacking

## 🔗 Integrações

### WhatsApp (Z-API)
- Envio e recebimento de mensagens
- Suporte a mídia (imagens, documentos)
- Grupos e contatos
- Status da instância
- Mensagens em massa

### Meta (Facebook/Instagram)
- Facebook Messenger
- Instagram Direct
- Publicação de posts
- Métricas de página
- Webhooks em tempo real

### Email (SendGrid)
- Envio de emails transacionais
- Templates personalizados
- Tracking de eventos
- Listas de contatos
- Analytics de email

## 🧪 Testes

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd ai-marketing-automation
npm test
```

## 📈 Monitoramento

### Logs
Os logs são armazenados em:
- `backend/logs/combined.log` - Todos os logs
- `backend/logs/error.log` - Apenas erros
- `backend/logs/exceptions.log` - Exceções não tratadas

### Health Check
Monitore a saúde da aplicação em: `GET /health`

### Métricas
- Performance dos agentes de IA
- Taxa de resposta dos webhooks
- Métricas de campanhas
- Analytics em tempo real

## 🔒 Segurança

- **Rate Limiting**: Proteção contra spam
- **Validação de Dados**: Joi para validação
- **CORS**: Configurado para domínios específicos
- **Helmet**: Headers de segurança
- **Logs de Auditoria**: Rastreamento de ações

## 🚀 Deploy

### Desenvolvimento
```bash
# Backend
cd backend && npm run dev

# Frontend
cd ai-marketing-automation && npm start
```

### Produção
```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd ai-marketing-automation && npm run build
```

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, envie um email para suporte@painelintegrado.com ou abra uma issue no GitHub.

## 🎉 Agradecimentos

- OpenAI pela API GPT-4
- Z-API pela integração WhatsApp
- Meta pela Graph API
- SendGrid pela API de email
- Comunidade open source

---

**Desenvolvido com ❤️ para automatizar e otimizar seu marketing digital**
