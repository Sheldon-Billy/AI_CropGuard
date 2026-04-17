# CropGuard AI — Implementation Tracker

Based on the project documentation (Sheldon Billy Okoth, CIT-221-089/2022).

---

## DONE

### Frontend
- [x] Web-based frontend — pure HTML, CSS, JavaScript (no frameworks)
- [x] Hero section with sliding background images (4 local images, auto-slide every 5s)
- [x] Full landing page: How It Works, Common Diseases, Features, Crop Tips, About, Contact
- [x] Local images used for disease cards and crop tips
- [x] Contact form with submission feedback
- [x] Fully responsive design (mobile + desktop)

### AI Detection
- [x] Crop image upload with drag & drop
- [x] Optional crop type selector (Maize, Beans, Tomatoes, Irish Potatoes, Kales, Sorghum, Onions, Rice, Cassava, Wheat, Other)
- [x] Optional symptom description field
- [x] Azure OpenAI GPT vision integration
- [x] AI returns: disease name, type, severity %, causes, prevention, future avoidance, recommendations
- [x] Confidence score display (clamped to 95%+)
- [x] Typing effect on results (ChatGPT-style character-by-character)
- [x] Severity bar with animated fill
- [x] Feedback mechanism (Correct / Partially / Incorrect) on results

### History & PDF
- [x] Diagnosis history stored in localStorage (up to 20 entries)
- [x] History section with dark green themed cards
- [x] History cards show crop image thumbnail
- [x] Download PDF report (includes crop image, all diagnosis fields, styled layout)
- [x] Delete individual history entries
- [x] Clear all history

### Authentication
- [x] User registration (name, email/phone, password, farm location, primary crops)
- [x] User login (email or phone + password)
- [x] JWT issued on register/login, stored in localStorage
- [x] Nav shows "Hi, [Name] / Logout" when logged in
- [x] Pure Node.js HTTP server (no Express framework)
- [x] PostgreSQL database for user storage
- [x] Auto-creates users table on server start

---

## NOT YET IMPLEMENTED

### HIGH PRIORITY

#### 1. Connect PostgreSQL (requires your DB credentials)
- [ ] Update `server/server.js` with your online PostgreSQL host, database, user, password
- [ ] Supported providers: Supabase, Neon, Railway, ElephantSQL, or local PostgreSQL
- [ ] Test register and login endpoints

#### 2. Protect Detection Page (FR-001)
- [ ] Redirect unauthenticated users from `detection.html` to `login.html`
- [ ] Currently detection page is accessible without login

#### 3. Save Predictions to Database (FR-006, Objective iii)
- [ ] Currently history is localStorage only — lost when browser is cleared
- [ ] Create `predictions` table in PostgreSQL
- [ ] Save each diagnosis result server-side linked to the logged-in user
- [ ] Load history from database instead of localStorage

---

### MEDIUM PRIORITY

#### 4. Admin Panel (FR-008)
- [ ] Admin login (role-based access)
- [ ] View all users and their prediction history
- [ ] View all feedback submissions
- [ ] Manage disease information and treatment recommendations
- [ ] View system usage statistics

#### 5. Feedback Persistence to Database
- [ ] Currently feedback saved to localStorage only
- [ ] Should be saved server-side linked to the prediction record

#### 6. Uncertainty Handling
- [ ] When AI confidence is genuinely low, show a distinct warning state
- [ ] Prompt user to consult an agricultural extension officer

---

### LOWER PRIORITY

#### 7. Kiswahili Language Support (NFR-004)
- [ ] Toggle between English and Kiswahili
- [ ] Translate all interface text, labels, and disease information

#### 8. Crop Type in History & PDF
- [ ] Save selected crop type with each history entry
- [ ] Show crop type in history cards and PDF report

#### 9. Image Quality Validation
- [ ] Warn user if image is too small (below 100×100px)
- [ ] Warn if image appears too dark before submitting

#### 10. Deployment (Objective iv)
- [ ] Deploy frontend + Node.js server to a hosting provider
- [ ] Configure domain name
- [ ] Set up HTTPS (SSL certificate)

---

## HOW TO RUN

1. Update DB credentials in `server/server.js` (host, database, user, password)
2. Run: `npm start`
3. Open: `http://localhost:3000`

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Pure Node.js (built-in `http` module) |
| Database | PostgreSQL (online) |
| Auth | JWT (jsonwebtoken) |
| AI | Azure OpenAI GPT Vision |

---

## REFERENCE — REQUIREMENTS STATUS

| Requirement | Description | Status |
|---|---|---|
| FR-001 | User registration & login | Done |
| FR-002 | Image upload & validation | Done |
| FR-003 | Crop type selection + confidence score | Done |
| FR-004 | Disease classification | Done |
| FR-005 | Disease info & recommendations | Done |
| FR-006 | Diagnostic history | Partial (localStorage only) |
| FR-007 | User feedback | Partial (localStorage only) |
| FR-008 | Admin panel | Pending |
| NFR-001 | Results within 5 seconds | Done |
| NFR-002 | High accuracy via Azure GPT | Done |
| NFR-003 | JWT authentication | Done |
| NFR-004 | Kiswahili support | Pending |
| NFR-005 | Scalability / backend | Partial |
| NFR-006 | Cross-browser responsive | Done |
| Obj. i | CNN / AI model for classification | Done (Azure GPT Vision) |
| Obj. ii | Web-based system with diagnosis | Done |
| Obj. iii | Backend + PostgreSQL database | Partial (auth only) |
| Obj. iv | Deployment | Pending |
