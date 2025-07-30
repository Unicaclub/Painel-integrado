import React, { useState, useEffect, useRef } from 'react';
import './AIChat.css';

interface User {
  id: string;
  name: string;
  email: string;
  isFirstTime: boolean;
  isAuthenticated: boolean;
}

interface AIChatProps {
  user: User;
  isOpen: boolean;
  onToggle: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

const AIChat: React.FC<AIChatProps> = ({ user, isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'create-campaign',
      label: 'Create Campaign',
      prompt: 'I want to create a new marketing campaign',
      icon: '🚀'
    },
    {
      id: 'analyze-performance',
      label: 'Analyze Performance',
      prompt: 'Show me insights about my current campaigns',
      icon: '📊'
    },
    {
      id: 'optimize-budget',
      label: 'Optimize Budget',
      prompt: 'Help me optimize my marketing budget allocation',
      icon: '💰'
    },
    {
      id: 'content-ideas',
      label: 'Content Ideas',
      prompt: 'Generate content ideas for my social media campaigns',
      icon: '💡'
    }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: `Hi ${user.name}! 👋 I'm your AI marketing assistant. I can help you create campaigns, analyze performance, optimize budgets, and much more. What would you like to work on today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user.name, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Simple response logic based on keywords
    const message = userMessage.toLowerCase();
    
    if (message.includes('campaign') || message.includes('create')) {
      return `I'd be happy to help you create a new campaign! 🚀

To get started, I need to understand your goals better:

1. **What's your main objective?** (Brand awareness, lead generation, sales, etc.)
2. **Which platforms** do you want to use? (Instagram, Facebook, WhatsApp, Email)
3. **What's your target audience?** (Demographics, interests, location)
4. **What's your budget range?**
5. **Do you have any creative assets** (images, videos, copy) or should I help generate them?

Once I have these details, I can create a comprehensive campaign strategy with:
- Optimized ad copy and creatives
- Audience targeting recommendations
- Budget allocation across platforms
- Performance tracking setup

What's your main goal for this campaign?`;
    }
    
    if (message.includes('performance') || message.includes('analytics') || message.includes('insights')) {
      return `Let me analyze your current campaign performance! 📊

Based on your recent campaigns, here are some key insights:

**📈 Performance Highlights:**
- Your Instagram campaigns have a 2.67% CTR (above industry average!)
- WhatsApp campaigns show 7.11% conversion rate
- Facebook campaigns need optimization (5.06% CTR vs 7.5% potential)

**🎯 Recommendations:**
1. **Increase Instagram budget** - It's your best performing platform
2. **A/B test Facebook ad creatives** - Try video content vs static images
3. **Expand WhatsApp automation** - High conversion rate indicates strong audience fit
4. **Optimize for mobile** - 78% of your traffic is mobile

**🚀 Quick Wins:**
- Reallocate 20% budget from Facebook to Instagram
- Create 3 new video creatives for Facebook
- Set up WhatsApp chatbot for lead qualification

Would you like me to implement any of these optimizations automatically?`;
    }
    
    if (message.includes('budget') || message.includes('optimize') || message.includes('allocation')) {
      return `Let me help you optimize your marketing budget! 💰

**Current Budget Analysis:**
- Total Monthly Budget: $10,000
- Instagram: $5,000 (50%) - **Performing well** ✅
- Facebook: $3,000 (30%) - **Needs optimization** ⚠️
- WhatsApp: $2,000 (20%) - **High ROI** 🎯

**Recommended Reallocation:**
- Instagram: $5,500 (55%) - Increase by $500
- Facebook: $2,500 (25%) - Decrease by $500, focus on video content
- WhatsApp: $2,000 (20%) - Maintain, add automation

**Expected Results:**
- 15-20% increase in overall ROAS
- 25% more qualified leads
- Better cost per acquisition

**Budget Optimization Features I can set up:**
1. **Auto-bidding** based on performance
2. **Daily budget caps** to prevent overspend
3. **Performance alerts** when campaigns underperform
4. **Automatic pause/resume** based on ROI thresholds

Should I implement these budget optimizations for you?`;
    }
    
    if (message.includes('content') || message.includes('ideas') || message.includes('creative')) {
      return `I'll generate some creative content ideas for you! 💡

**Content Strategy Based on Your Business:**

**📸 Instagram Content Ideas:**
1. **Behind-the-scenes** posts showing your process
2. **User-generated content** campaigns with branded hashtags
3. **Story polls** asking audience preferences
4. **Carousel posts** showcasing product features
5. **Reels** with trending audio and quick tips

**👥 Facebook Content Ideas:**
1. **Video testimonials** from satisfied customers
2. **Live Q&A sessions** about your industry
3. **Educational posts** solving common problems
4. **Community polls** for engagement
5. **Event announcements** and behind-the-scenes

**💬 WhatsApp Content Ideas:**
1. **Welcome sequences** for new subscribers
2. **Exclusive offers** for WhatsApp followers
3. **Quick customer support** responses
4. **Product catalogs** with easy ordering
5. **Appointment booking** automation

**Content Calendar Suggestions:**
- **Monday:** Motivational/Educational
- **Wednesday:** Product/Service Spotlight
- **Friday:** Behind-the-scenes/Fun content
- **Weekend:** User-generated content

Would you like me to create specific content for any of these ideas, or set up a content calendar for you?`;
    }
    
    // Default response
    return `I understand you're looking for help with your marketing! 🤖

I can assist you with:
- **Creating new campaigns** across Instagram, Facebook, WhatsApp, and Email
- **Analyzing performance** and providing actionable insights
- **Optimizing budgets** for better ROI
- **Generating content ideas** and creative assets
- **Setting up automation** for lead nurturing
- **A/B testing strategies** to improve results

What specific area would you like to focus on? Just describe what you're trying to achieve, and I'll create a detailed plan for you!`;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const aiResponse = await simulateAIResponse(content);
      
      setIsTyping(false);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .split('\n')
      .map((line, index) => (
        <div key={index} dangerouslySetInnerHTML={{ __html: line || '<br>' }} />
      ));
  };

  if (!isOpen) return null;

  return (
    <div className="ai-chat-overlay">
      <div className="ai-chat-container">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="ai-avatar">🤖</div>
            <div>
              <h3>AI Marketing Assistant</h3>
              <p className={`status ${isTyping ? 'typing' : 'online'}`}>
                {isTyping ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          <button className="close-chat-btn" onClick={onToggle}>
            ✕
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              {message.type === 'ai' && (
                <div className="message-avatar">🤖</div>
              )}
              <div className="message-content">
                <div className="message-text">
                  {formatMessageContent(message.content)}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              {message.type === 'user' && (
                <div className="message-avatar user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="message ai">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="quick-actions">
            <p>Quick actions to get started:</p>
            <div className="quick-actions-grid">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className="quick-action-btn"
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your marketing campaigns..."
              className="chat-input"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="send-btn"
            >
              {isLoading ? (
                <div className="loading-spinner small"></div>
              ) : (
                '➤'
              )}
            </button>
          </div>
          <p className="input-hint">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
