import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TenderList from "./pages/TenderList";
import TenderDetails from "./pages/TenderDetails";
import CreateTender from "./pages/CreateTender";
import BidderList from "./pages/BidderList";
import AllBidders from "./pages/AllBidders";
import BidderEvaluation from "./pages/BidderEvaluation";
import DocumentCenter from "./pages/DocumentCenter";
import DocumentViewer from "./pages/DocumentViewer";
import ComplianceOverview from "./pages/ComplianceOverview";
import RiskAnalysis from "./pages/RiskAnalysis";
import AuditTrail from "./pages/AuditTrail";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/tenders" element={<TenderList />} />
        <Route path="/tenders/create" element={<CreateTender />} />
        <Route path="/tenders/:tenderId" element={<TenderDetails />} />
        <Route path="/tenders/:tenderId/bidders" element={<BidderList />} />

        <Route path="/bidders" element={<AllBidders />} />
        <Route path="/bidders/:bidderId" element={<BidderEvaluation />} />

        <Route path="/documents" element={<DocumentCenter />} />
        <Route path="/documents/:documentId" element={<DocumentViewer />} />

        <Route path="/compliance" element={<ComplianceOverview />} />
        <Route path="/risk-analysis" element={<RiskAnalysis />} />
        <Route path="/audit-trail" element={<AuditTrail />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
