// ============================================================================
// services/api.js
//
// Central API layer for BidSure AI.
//
// Every page/component talks to the backend ONLY through this file.
// Right now each function resolves mock data after a small artificial
// delay (to simulate network latency for realistic UI states).
//
// TO CONNECT THE REAL JAVA / SPRING BOOT BACKEND:
//   1. Replace the body of each function with a `fetch(`${BASE_URL}/...`)`
//      call (see the commented example in `getTenders`).
//   2. Keep the function signatures and return shapes identical so that
//      no page/component code needs to change.
//   3. Set VITE_API_BASE_URL in a .env file and read it via
//      import.meta.env.VITE_API_BASE_URL.
// ============================================================================

import {
  tenders,
  bidders,
  complianceResults,
  mismatches,
  riskBreakdown,
  aiSummaries,
  documents,
  extractionDetail,
  auditTrail,
  dashboardKpis,
  addAuditEntry,
} from "../data/mockData";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"; // eslint-disable-line no-unused-vars
const MOCK_DELAY = 250;

function resolveAfterDelay(data, delay = MOCK_DELAY) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay);
  });
}

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------
export async function login(credentials) {
  // Real backend:
  // const res = await fetch(`${BASE_URL}/auth/login`, { method: "POST", body: JSON.stringify(credentials) });
  // return res.json();
  return resolveAfterDelay({
    token: "mock-jwt-token",
    user: { name: "Procurement Officer", org: "Demo Organization", email: credentials?.email || "officer@demo.gov.in" },
  }, 400);
}

// ---------------------------------------------------------------------------
// DASHBOARD
// ---------------------------------------------------------------------------
export async function getDashboardKpis() {
  return resolveAfterDelay(dashboardKpis);
}

export async function getRecentTenders(limit = 5) {
  return resolveAfterDelay(tenders.slice(0, limit));
}

// ---------------------------------------------------------------------------
// TENDERS
// ---------------------------------------------------------------------------
export async function getTenders() {
  // Real backend example:
  // const res = await fetch(`${BASE_URL}/tenders`);
  // if (!res.ok) throw new Error("Failed to fetch tenders");
  // return res.json();
  return resolveAfterDelay(tenders);
}

export async function getTenderById(tenderId) {
  const tender = tenders.find((t) => t.id === tenderId);
  return resolveAfterDelay(tender || null);
}

export async function createTender(payload) {
  const newTender = {
    id: payload.id || `GEM-2026-${Math.floor(Math.random() * 900 + 100)}`,
    title: payload.title,
    organization: payload.organization,
    department: payload.department,
    category: payload.category,
    createdDate: new Date().toISOString().slice(0, 10),
    deadline: payload.deadline,
    status: "Active",
    bidderCount: 0,
    requirements: payload.requirements || [],
  };
  tenders.unshift(newTender);
  addAuditEntry({ user: "Procurement Officer", action: "Created tender", entity: newTender.id, result: "Success" });
  return resolveAfterDelay(newTender, 500);
}

// ---------------------------------------------------------------------------
// BIDDERS
// ---------------------------------------------------------------------------
export async function getBiddersByTender(tenderId) {
  return resolveAfterDelay(bidders.filter((b) => b.tenderId === tenderId));
}

export async function getBidderById(bidderId) {
  const bidder = bidders.find((b) => b.id === bidderId);
  return resolveAfterDelay(bidder || null);
}

export async function getAllBidders() {
  return resolveAfterDelay(bidders);
}

// ---------------------------------------------------------------------------
// COMPLIANCE / EVALUATION
// ---------------------------------------------------------------------------
export async function getComplianceResults(bidderId) {
  return resolveAfterDelay(complianceResults[bidderId] || []);
}

export async function getMismatches(bidderId) {
  return resolveAfterDelay(mismatches[bidderId] || []);
}

export async function getRiskBreakdown(bidderId) {
  return resolveAfterDelay(riskBreakdown[bidderId] || []);
}

export async function getAiSummary(bidderId) {
  return resolveAfterDelay(
    aiSummaries[bidderId] || {
      assessment: "No AI analysis available yet for this bidder.",
      findings: [],
      recommendation: "Awaiting Documents",
    }
  );
}

export async function submitFinalDecision(bidderId, decision, note = "") {
  const bidder = bidders.find((b) => b.id === bidderId);
  if (bidder) {
    bidder.finalDecision = decision;
  }
  addAuditEntry({
    user: "Procurement Officer",
    action: "Final decision",
    entity: bidder ? bidder.name : bidderId,
    result: decision,
  });
  return resolveAfterDelay({ success: true, decision, note }, 400);
}

// ---------------------------------------------------------------------------
// DOCUMENTS
// ---------------------------------------------------------------------------
export async function getDocuments(bidderId = null) {
  const filtered = bidderId ? documents.filter((d) => d.bidderId === bidderId) : documents;
  return resolveAfterDelay(filtered);
}

export async function getDocumentExtraction(documentId) {
  return resolveAfterDelay(extractionDetail[documentId] || null);
}

export async function uploadDocument(file, meta = {}) {
  const newDoc = {
    id: `DOC-${Math.floor(Math.random() * 9000 + 1000)}`,
    name: file?.name || "document.pdf",
    type: meta.type || "Unclassified",
    bidderId: meta.bidderId || null,
    bidder: meta.bidder || "—",
    uploaded: new Date().toISOString().slice(0, 10),
    extraction: "Processing",
    verification: "Pending",
  };
  documents.unshift(newDoc);
  addAuditEntry({
    user: "Procurement Officer",
    action: `Uploaded ${newDoc.name}`,
    entity: meta.bidder || meta.tenderId || "—",
    result: "Success",
  });
  return resolveAfterDelay(newDoc, 600);
}

// ---------------------------------------------------------------------------
// AUDIT TRAIL
// ---------------------------------------------------------------------------
export async function getAuditTrail() {
  return resolveAfterDelay(auditTrail);
}
