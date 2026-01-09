# ARTHA OS: COMPLIANCE & DATA SOVEREIGNTY PROTOCOL
> **Strict Enforcement Required per Legal Council (Rajiv)**

## 1. Data Residency (DPDP Act 2023)
All "Critical Personal Data" (User Profiles, Financial Liabilities) MUST be stored and processed within the territory of India.

**Configuration:**
- **Primary Region:** `ap-south-1` (Mumbai)
- **Failover:** `ap-south-1` (availability zone 2) - NO backup to EU/US.
- **CDN:** Edge caching for static assets allowed globally, but API responses containing PII must originate from Mumbai.

**Verification:**
Run `npm run compliance:check` (Mock) to verify region pinning.

## 2. Investment Advice (SEBI)
Artha OS is a **Technology Platform**, not an Investment Advisor.
- **PROHIBITED:** "Buy X", "Sell Y", "Target Price: ₹500"
- **ALLOWED:** "Scenario A yields outcome B", "Historical Trend"
- **Disclaimers:** Every simulation screen must explicitly state: *"Deterministic scenario primarily for audit readiness. Not financial advice."*

## 3. Auditor Access (BRSR Core)
Auditors (Third-Party Assurance Providers) have:
- **READ Access:** All Emissions Data, Project Verifications.
- **WRITE Access:** `status`, `technician_comments` ONLY.
- **BLOCKED:** Cannot modify raw `co2e_tons` or `financial_liability`.

## 4. Encryption
- At Rest: AES-256 (AWS default)
- In Transit: TLS 1.3
