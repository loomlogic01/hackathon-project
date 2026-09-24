import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import DashboardOverview from './components/DashboardOverview';
import TenderWorkspace from './components/TenderWorkspace';
import PortalLookup from './components/PortalLookup';
import BidChatbot from './components/BidChatbot';
import AuditHistory from './components/AuditHistory';
import { checkBackendHealth, getAllEvaluations, SAMPLE_BIDS_CATALOG } from './services/api';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Dashboard View State
  const [activeView, setActiveView] = useState('overview');
  const [backendStatus, setBackendStatus] = useState({ status: 'checking' });
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [evaluationsList, setEvaluationsList] = useState([]);

  useEffect(() => {
    const sample1 = SAMPLE_BIDS_CATALOG[0];
    const initialSample = {
      filename: sample1.filename,
      id: 1,
      tender_id: sample1.tenderId,
      risk_level: sample1.riskLevel,
      parsed_data: sample1.parsed,
      mock_api_verifications: {
        gstn_verification: { valid: true, message: "Verified Active with GSTN Database" },
        msme_verification: { valid: true, message: "Verified Micro Enterprise on Udyam Portal" },
        pan_verification: { valid: true, message: "Verified Income Tax Entity Record" }
      },
      compliance_evaluation: {
        overall_score: sample1.score,
        passed_checks: sample1.passedChecks,
        failed_checks: sample1.failedChecks
      },
      compliance_status: sample1.status,
      ai_review: {
        extraction_looks_correct: true,
        notes: "Udyam and GSTIN matches official public procurement registries.",
        summary: sample1.aiSummary
      },
      officer_decision: sample1.officerDecision,
      evaluated_at: sample1.date
    };

    setCurrentEvaluation(initialSample);
    const checkApi = async () => {
      const status = await checkBackendHealth();
      setBackendStatus(status);
      try {
        const records = await getAllEvaluations();
        if (records && records.length > 0) {
          setEvaluationsList(records);
        } else {
          setEvaluationsList(SAMPLE_BIDS_CATALOG.map(s => ({
            id: s.id === 'sample-1' ? 1 : s.id === 'sample-2' ? 2 : 3,
            filename: s.filename,
            company: s.company,
            tender_id: s.tenderId,
            score: s.score,
            compliance_status: s.status,
            officer_decision: s.officerDecision,
            created_at: s.date,
            passed_checks: s.passedChecks,
            failed_checks: s.failedChecks,
            ai_summary: s.aiSummary,
            parsed_data: s.parsed
          })));
        }
      } catch (e) {
        setEvaluationsList(SAMPLE_BIDS_CATALOG.map(s => ({
          id: s.id === 'sample-1' ? 1 : s.id === 'sample-2' ? 2 : 3,
          filename: s.filename,
          company: s.company,
          tender_id: s.tenderId,
          score: s.score,
          compliance_status: s.status,
          officer_decision: s.officerDecision,
          created_at: s.date,
          passed_checks: s.passedChecks,
          failed_checks: s.failedChecks,
          ai_summary: s.aiSummary,
          parsed_data: s.parsed
        })));
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleEvaluationUpdated = (newEval) => {
    setEvaluationsList(prev => [newEval, ...prev]);
  };

  const handleSelectBidFromOverview = (bid) => {
    setCurrentEvaluation(bid);
    setActiveView('workspace');
  };

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // If authenticated, render Procurement Officer Dashboard
  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      
      {/* Officer Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar */}
        <TopNavbar
          backendStatus={backendStatus}
          activeTender="GEM/2026/B/894721"
          user={currentUser}
          onLogout={handleLogout}
        />

        {/* View Content */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {activeView === 'overview' && (
            <DashboardOverview
              evaluations={evaluationsList}
              onSelectBid={handleSelectBidFromOverview}
              onGoToWorkspace={() => setActiveView('workspace')}
              onGoToLookup={() => setActiveView('portal')}
            />
          )}

          {activeView === 'workspace' && (
            <TenderWorkspace
              currentEvaluation={currentEvaluation}
              setCurrentEvaluation={setCurrentEvaluation}
              evaluationsList={evaluationsList}
              onEvaluationUpdated={handleEvaluationUpdated}
            />
          )}

          {activeView === 'portal' && (
            <PortalLookup />
          )}

          {activeView === 'copilot' && (
            <BidChatbot
              currentEvaluation={currentEvaluation}
            />
          )}

          {activeView === 'audit' && (
            <AuditHistory
              onSelectEvaluation={(item) => {
                setCurrentEvaluation(item);
                setActiveView('workspace');
              }}
            />
          )}

        </main>
      </div>

    </div>
  );
}
