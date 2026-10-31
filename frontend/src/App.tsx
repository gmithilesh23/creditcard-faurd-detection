import React, { useState } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Overview } from './pages/Overview';
import { TransactionMonitoring } from './pages/TransactionMonitoring';
import { FraudDetection } from './pages/FraudDetection';
import { TransactionAnalytics } from './pages/TransactionAnalytics';
import { RiskAnalysis } from './pages/RiskAnalysis';
import { AIInsights } from './pages/AIInsights';
import { ModelPerformance } from './pages/ModelPerformance';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            onNavigateToMonitoring={() => setActiveTab('monitoring')}
            onNavigateToDetection={() => setActiveTab('detection')}
          />
        );
      case 'monitoring':
        return <TransactionMonitoring />;
      case 'detection':
        return <FraudDetection />;
      case 'analytics':
        return <TransactionAnalytics />;
      case 'risk':
        return <RiskAnalysis />;
      case 'insights':
        return <AIInsights />;
      case 'performance':
        return <ModelPerformance />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <Overview
            onNavigateToMonitoring={() => setActiveTab('monitoring')}
            onNavigateToDetection={() => setActiveTab('detection')}
          />
        );
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActivePage()}
    </DashboardLayout>
  );
};

export default App;

