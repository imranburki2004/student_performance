# Risk Register & Mitigation Strategy
**EduPulse DIK — Govt. Degree College No. 1, Dera Ismail Khan**
*Final Year Project — Risk Management Plan*

---

| Risk ID | Risk Description | Category | Probability | Impact | Mitigation Strategy & Countermeasure | Contingency Plan |
|---|---|---|---|---|---|---|
| **RSK-01** | Database server crash or hardware loss on host PC | Technical | Medium | Critical | Automated daily SQLite/MySQL backups in `database/backups`, cloud replication guide, and zero-setup offline fallback. | Instant restore from latest backup file via `npm run restore`. |
| **RSK-02** | Examination grading formula calculation mismatch | Academic | Low | High | Formulas locked strictly to official HEC / Gomal University standard scale; automated unit tests verify test cases. | Re-run batch grade calculation with verified grade scale matrix. |
| **RSK-03** | Faculty unauthorized marks alterations | Security | Low | High | Grade locking flag (`is_locked`); full audit trail logging user ID, old values, new values, and client IP in `audit_logs`. | Revert unauthorized changes using audit log timestamps. |
| **RSK-04** | Erroneous fine payment entry by accounts clerk | Financial | Medium | Medium | Financial ledger reversal ("Unpay") module with mandatory justification remarks and audit log recording. | Ledger reversal with supervisor electronic signature. |
| **RSK-05** | High concurrent traffic during result announcement | Performance | Medium | High | Clustered PM2 process management, database index optimizations, client-side caching via Service Worker. | Nginx reverse proxy rate-limiting and connection pooling. |
| **RSK-06** | Browser incompatibility or lack of Node.js on evaluator machine | Operational | High | Critical | Zero-dependency standalone browser architecture allowing instant execution of `public/index.html` on any device. | Run standalone offline mode directly in Chrome or Edge. |
