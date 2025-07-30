import React, { useState } from 'react';
import './OnboardingFlow.css';

interface User {
  id: string;
  name: string;
  email: string;
  isFirstTime: boolean;
  isAuthenticated: boolean;
}

interface OnboardingFlowProps {
  user: User;
  onComplete: () => void;
}

interface OnboardingData {
  businessName: string;
  businessType: string;
  targetAudience: string;
  marketingGoals: string[];
  budget: string;
  platforms: string[];
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessName: '',
    businessType: '',
    targetAudience: '',
    marketingGoals: [],
    budget: '',
    platforms: []
  });

  const steps = [
    {
      title: 'Welcome to AI Marketing Automation',
      subtitle: `Hi ${user.name}! Let's set up your intelligent marketing assistant.`,
      component: 'welcome'
    },
    {
      title: 'Tell us about your business',
      subtitle: 'This helps our AI understand your brand and create better campaigns.',
      component: 'business'
    },
    {
      title: 'What are your marketing goals?',
      subtitle: 'Select all that apply to customize your AI assistant.',
      component: 'goals'
    },
    {
      title: 'Choose your platforms',
      subtitle: 'Select where you want to run your marketing campaigns.',
      component: 'platforms'
    },
    {
      title: 'Set your budget range',
      subtitle: 'This helps our AI optimize your campaigns effectively.',
      component: 'budget'
    },
    {
      title: 'You\'re all set!',
      subtitle: 'Your AI marketing assistant is ready to help you create amazing campaigns.',
      component: 'complete'
    }
  ];

  const businessTypes = [
    'E-commerce', 'SaaS', 'Local Business', 'Agency', 'Consultant', 
    'Restaurant', 'Healthcare', 'Education', 'Real Estate', 'Other'
  ];

  const marketingGoals = [
    'Increase Brand Awareness', 'Generate Leads', 'Drive Sales', 
    'Boost Engagement', 'Grow Social Following', 'Improve Customer Retention',
    'Launch New Product', 'Expand Market Reach'
  ];

  const platforms = [
    { id: 'whatsapp', name: 'WhatsApp Business', icon: '💬' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'facebook', name: 'Facebook', icon: '👥' },
    { id: 'email', name: 'Email Marketing', icon: '📧' }
  ];

  const budgetRanges = [
    '$500 - $1,000', '$1,000 - $5,000', '$5,000 - $10,000', 
    '$10,000 - $25,000', '$25,000+'
  ];

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: keyof OnboardingData, value: string) => {
    const currentArray = onboardingData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleInputChange(field, newArray);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save onboarding data
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    onComplete();
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.component) {
      case 'welcome':
        return (
          <div className="welcome-content">
            <div className="welcome-icon">🚀</div>
            <h2>Ready to revolutionize your marketing?</h2>
            <p>Our AI will help you create, manage, and optimize campaigns across multiple platforms with just simple conversations.</p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🤖</span>
                <span>AI-powered campaign creation</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Real-time analytics & optimization</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Multi-platform automation</span>
              </div>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="form-content">
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                placeholder="Enter your business name"
                value={onboardingData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Business Type</label>
              <div className="options-grid">
                {businessTypes.map(type => (
                  <button
                    key={type}
                    className={`option-button ${onboardingData.businessType === type ? 'selected' : ''}`}
                    onClick={() => handleInputChange('businessType', type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Target Audience</label>
              <textarea
                placeholder="Describe your ideal customers (age, interests, location, etc.)"
                value={onboardingData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                className="input-field textarea"
                rows={3}
              />
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="form-content">
            <div className="options-grid">
              {marketingGoals.map(goal => (
                <button
                  key={goal}
                  className={`option-button ${onboardingData.marketingGoals.includes(goal) ? 'selected' : ''}`}
                  onClick={() => handleArrayToggle('marketingGoals', goal)}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        );

      case 'platforms':
        return (
          <div className="form-content">
            <div className="platforms-grid">
              {platforms.map(platform => (
                <button
                  key={platform.id}
                  className={`platform-button ${onboardingData.platforms.includes(platform.id) ? 'selected' : ''}`}
                  onClick={() => handleArrayToggle('platforms', platform.id)}
                >
                  <span className="platform-icon">{platform.icon}</span>
                  <span className="platform-name">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="form-content">
            <div className="options-grid">
              {budgetRanges.map(range => (
                <button
                  key={range}
                  className={`option-button ${onboardingData.budget === range ? 'selected' : ''}`}
                  onClick={() => handleInputChange('budget', range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="complete-content">
            <div className="complete-icon">🎉</div>
            <h2>Welcome aboard!</h2>
            <p>Your AI marketing assistant is now configured and ready to help you create amazing campaigns.</p>
            <div className="setup-summary">
              <h3>Your Setup:</h3>
              <div className="summary-item">
                <strong>Business:</strong> {onboardingData.businessName} ({onboardingData.businessType})
              </div>
              <div className="summary-item">
                <strong>Goals:</strong> {onboardingData.marketingGoals.join(', ')}
              </div>
              <div className="summary-item">
                <strong>Platforms:</strong> {onboardingData.platforms.length} selected
              </div>
              <div className="summary-item">
                <strong>Budget:</strong> {onboardingData.budget}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].component) {
      case 'welcome':
        return true;
      case 'business':
        return onboardingData.businessName && onboardingData.businessType;
      case 'goals':
        return onboardingData.marketingGoals.length > 0;
      case 'platforms':
        return onboardingData.platforms.length > 0;
      case 'budget':
        return onboardingData.budget;
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="step-info">
            <span className="step-number">Step {currentStep + 1} of {steps.length}</span>
          </div>
        </div>

        <div className="onboarding-content">
          <div className="step-header">
            <h1>{steps[currentStep].title}</h1>
            <p>{steps[currentStep].subtitle}</p>
          </div>

          <div className="step-body">
            {renderStepContent()}
          </div>
        </div>

        <div className="onboarding-footer">
          <div className="button-group">
            {currentStep > 0 && (
              <button onClick={prevStep} className="btn-secondary">
                Back
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={nextStep} 
                className="btn-primary"
                disabled={!canProceed()}
              >
                Continue
              </button>
            ) : (
              <button 
                onClick={handleComplete} 
                className="btn-primary"
              >
                Start Using AI Assistant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
