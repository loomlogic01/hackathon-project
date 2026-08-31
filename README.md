# BidSure AI — Bid Compliance Verification Platform (Frontend Prototype)

AI-assisted bid compliance verification with evidence-backed decisions.
Built for the SIH hackathon problem statement: **AI-Powered Integrated Bid
Compliance Verification Platform for GeM Procurement**.

> ⚠️ **Important product principle baked into the UI:** the AI is a
> decision-support layer only. No screen ever states that a bidder is
> automatically qualified or disqualified — every recommendation is labelled
> "Manual Review Recommended" / "Procurement Officer review required", and
> the final Approve / Reject / Send-for-Review action is always a deliberate,
> confirmed action taken by the Procurement Officer.

---

## 1. Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router (HashRouter, so the build also works as a static file/demo)
- Lucide React (icons)
- Recharts (Risk Breakdown bar chart, Risk Distribution pie chart)
- Mock JSON data (`src/data/mockData.js`) served through a mock API layer
  (`src/services/api.js`) — no real GeM/government API is called.

---

## 2. Setup Instructions

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# → opens on http://localhost:5173

# 3. Build for production
npm run build

# 4. Preview the production build
npm run preview
```

### Demo login
On the Login page, either fill in any email/password and click **Login**, or
click **Continue with Demo Login** — both go straight to the Dashboard (mock
auth only, no real credential check).

### Suggested demo flow (matches the judge walkthrough)
```
Login → Dashboard → Tenders → GEM-2026-001 → Evaluate Bidders
→ ABC Technologies Pvt Ltd → Compliance Checklist
→ Click "View Issue" on OEM Authorization → Evidence Panel
→ Scroll to Detected Inconsistencies → AI Verification Summary
→ Risk Breakdown chart → Procurement Officer Decision → Confirm
→ Audit Trail (see the decision logged)
```

---

## 3. Folder Structure

```
src/
  components/       Reusable UI building blocks
    Button.jsx
    Input.jsx            (Input, Select, Textarea, Checkbox)
    StatusBadge.jsx
    KpiCard.jsx
    DataTable.jsx
    Modal.jsx             (Modal, SidePanel)
    EvidencePanel.jsx
    ComplianceScore.jsx   (circular ring)
    ComplianceTable.jsx
    RiskChart.jsx
    DocumentCard.jsx
    FileUpload.jsx
    EmptyState.jsx        (EmptyState, LoadingState)
    Sidebar.jsx
    Topbar.jsx

  layouts/
    AppLayout.jsx     Sidebar + Topbar shell used by every authenticated page

  pages/
    Login.jsx
    Dashboard.jsx
    TenderList.jsx
    TenderDetails.jsx
    CreateTender.jsx
    BidderList.jsx           (bidders scoped to one tender)
    AllBidders.jsx           (sidebar "Bidders" — all bidders, all tenders)
    BidderEvaluation.jsx     the centerpiece screen
    DocumentCenter.jsx
    DocumentViewer.jsx
    ComplianceOverview.jsx
    RiskAnalysis.jsx
    AuditTrail.jsx
    Settings.jsx

  data/
    mockData.js       All demo data: tenders, bidders, compliance results,
                       mismatches, risk breakdowns, AI summaries, documents,
                       audit trail. This is the single source of truth for
                       the prototype and is what you'll eventually delete
                       once services/api.js talks to a real backend.

  services/
    api.js            Central API layer. Every page calls functions from
                       here (getTenders, getBidderById, getComplianceResults,
                       submitFinalDecision, uploadDocument, etc.) — never
                       imports mockData.js directly. This is the ONLY file
                       you need to change to connect a real backend.

  utils/
    format.js         Date formatting, status to badge-variant mapping
    risk.js           RISK_BANDS thresholds (edit here to retune HIGH /
                       MEDIUM / LOW banding across the whole app)

  App.jsx             Route table (React Router)
  main.jsx            App entry point
  index.css           Tailwind entry + small global resets
```

---

## 4. Connecting the Java / Spring Boot Backend

The frontend is already structured so that **only `src/services/api.js`**
needs to change — no page or component code should need to be touched.

1. **Set your API base URL.** Create a `.env` file at the project root:
   ```
   VITE_API_BASE_URL=https://your-backend-host/api
   ```
   `api.js` already reads `import.meta.env.VITE_API_BASE_URL`.

2. **Replace each mock function body with a `fetch` call**, keeping the
   same function name and return shape. Example (already sketched as a
   comment inside `getTenders`):
   ```js
   export async function getTenders() {
     const res = await fetch(`${BASE_URL}/tenders`);
     if (!res.ok) throw new Error("Failed to fetch tenders");
     return res.json();
   }
   ```

3. **Suggested Spring Boot REST endpoints** to mirror the mock functions:

   | Frontend function       | Suggested endpoint                         |
   |--------------------------|---------------------------------------------|
   | `login`                  | `POST /api/auth/login`                      |
   | `getTenders`              | `GET /api/tenders`                          |
   | `getTenderById`           | `GET /api/tenders/{id}`                     |
   | `createTender`            | `POST /api/tenders`                         |
   | `getBiddersByTender`      | `GET /api/tenders/{id}/bidders`             |
   | `getBidderById`           | `GET /api/bidders/{id}`                     |
   | `getComplianceResults`    | `GET /api/bidders/{id}/compliance`          |
   | `getMismatches`           | `GET /api/bidders/{id}/mismatches`          |
   | `getRiskBreakdown`        | `GET /api/bidders/{id}/risk-breakdown`      |
   | `getAiSummary`            | `GET /api/bidders/{id}/ai-summary`          |
   | `submitFinalDecision`     | `POST /api/bidders/{id}/decision`           |
   | `getDocuments`            | `GET /api/documents?bidderId=`              |
   | `getDocumentExtraction`   | `GET /api/documents/{id}/extraction`        |
   | `uploadDocument`          | `POST /api/documents` (multipart/form-data) |
   | `getAuditTrail`           | `GET /api/audit-trail`                      |

4. **Auth**: wire up JWT/session handling in `login()` and attach the token
   to subsequent requests (e.g. an `Authorization` header helper inside
   `api.js`). A `ProtectedRoute` wrapper can be added to `App.jsx` once real
   auth exists — the prototype currently allows direct navigation to any
   route for ease of demoing.

5. **AI extraction / scoring service**: whatever service performs OCR,
   field extraction, mismatch detection, and score computation should
   populate the same JSON shapes currently found in `mockData.js`
   (`complianceResults`, `mismatches`, `riskBreakdown`, `aiSummaries`) —
   these shapes were designed to map directly onto typical extraction
   pipeline output (per-field confidence, source document, reason string).

6. **File uploads**: `FileUpload.jsx` already gives you a `File` object via
   `onFileSelect`; wire it into `uploadDocument(file, meta)` with a real
   `multipart/form-data` POST once the backend endpoint exists.

---

## 5. Design Notes

- Color system: dark navy sidebar/nav, white/light-gray content background,
  green = PASS/LOW risk, amber = REVIEW/MEDIUM risk, red = FAIL/HIGH risk,
  blue = informational. Thresholds for risk banding live in
  `src/utils/risk.js` and are intentionally trivial to edit.
- No glassmorphism, no heavy gradients, no decorative animation — built to
  read as a trustworthy enterprise/government tool, not a consumer app.
- The **Bidder Evaluation** page (`src/pages/BidderEvaluation.jsx`) is the
  most information-dense screen by design, per the problem statement: score
  ring, PASS/REVIEW/FAIL/MISSING summary, full checklist, evidence panel,
  mismatch detection, AI summary, risk chart, and the final decision flow
  all live there.
- Every AI-generated recommendation string in the mock data was written to
  avoid "automatically rejected/approved" language — this is enforced as a
  product rule, not just incidental copy.

---

## 6. Known Prototype Limitations (by design)

- Auth is mocked — any email/password logs in.
- File uploads are stored only in local state / in-memory mock arrays; they
  are not actually persisted or parsed.
- Document preview in `DocumentViewer.jsx` is a placeholder (no real PDF
  rendering) — swap in a PDF.js viewer or `<iframe>` once real files exist.
- Data resets on page refresh (in-memory mock arrays).
