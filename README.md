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

## 4. Connecting the FastAPI (Python) Backend

The frontend is already structured so that **only `src/services/api.js`**
needs to change — no page or component code should need to be touched.

1. **Set your API base URL.** Create a `.env` file at the project root:
VITE_API_BASE_URL=http://localhost:8000
`api.js` already reads `import.meta.env.VITE_API_BASE_URL`.

2. **Replace each mock function body with a `fetch` call**, keeping the
   same function name and return shape. Example:
```js
   export async function uploadDocument(file) {
     const formData = new FormData();
     formData.append("file", file);
     const res = await fetch(`${BASE_URL}/upload-pdf/`, {
       method: "POST",
       body: formData,
     });
     if (!res.ok) throw new Error("Failed to upload document");
     return res.json();
   }
```

3. **Current FastAPI endpoints** (`backend/main.py`):

   | Endpoint                          | Method | Purpose                                              |
   |------------------------------------|--------|-------------------------------------------------------|
   | `/`                                 | GET    | Health check                                          |
   | `/upload-pdf/`                      | POST   | Upload a bid PDF, extract fields, run compliance scoring, store result |
   | `/get-evaluation/{filename}`        | GET    | Fetch stored evaluation(s) for a given filename        |
   | `/check-eligibility/`               | POST   | Manual eligibility check (company name, experience, MSME status) |
   | `/mock-api/gstn/{gstin}`            | GET    | Mock GSTN validity check                               |
   | `/mock-api/msme/{udyam_no}`         | GET    | Mock Udyam/MSME registration check                      |
   | `/mock-api/pan/{pan_no}`            | GET    | Mock PAN validity check                                 |

   > **Note:** the backend currently only handles PDF upload + compliance
   > scoring + mock verification — it does not yet expose tender/bidder
   > CRUD endpoints (`/tenders`, `/bidders`, etc.) that the frontend mock
   > data assumes. Those need to be added to `main.py` (with matching
   > tables in `database.py`) before the corresponding pages can be wired up.

4. **Run the backend locally:**
```bash
   cd backend
   pip install fastapi uvicorn pdfplumber python-multipart
   uvicorn main:app --reload --port 8000
```
   Interactive API docs available at `http://localhost:8000/docs`.

5. **CORS**: since the frontend (Vite, port 5173) and backend (FastAPI, port
   8000) run on different ports, add CORS middleware to `main.py`:
```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_methods=["*"],
       allow_headers=["*"],
   )
```

6. **File uploads**: `FileUpload.jsx` already gives you a `File` object via
   `onFileSelect`; wire it into `uploadDocument(file)` as shown above, using
   `multipart/form-data` against `/upload-pdf/`.
