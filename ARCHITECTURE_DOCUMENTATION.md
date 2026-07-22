# CropGuard AI - System Architecture Documentation

**Version:** 1.0.0  
**Last Updated:** July 7, 2026  
**Project:** AI-Driven Crop Disease Detection & Prevention System

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [API Integration Flow](#api-integration-flow)
4. [Database Schema & Entity Relationships](#database-schema--entity-relationships)
5. [Technology Stack](#technology-stack)
6. [Security Considerations](#security-considerations)
7. [Deployment Architecture](#deployment-architecture)

---

## Overview

CropGuard AI is a web-based agricultural technology platform that leverages Azure OpenAI's GPT-4 Vision capabilities to detect and diagnose crop diseases from uploaded images. The system provides farmers with actionable insights including disease identification, causes, prevention measures, and treatment recommendations.

### Key Features
- AI-powered crop disease detection using Azure OpenAI Vision
- User authentication and role-based access control (Farmer/Admin)
- Historical prediction tracking and PDF report generation
- Feedback collection system for continuous improvement
- Admin dashboard for user and prediction management
- Mobile-responsive design

---

## System Architecture

### High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (Browser)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Landing    │  │ Registration │  │   Detection  │  │   Admin   │ │
│  │   Page       │  │   & Login    │  │     Page     │  │  Dashboard│ │
│  │ (index.html) │  │              │  │              │  │           │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                  │                │       │
│         └─────────────────┴──────────────────┴────────────────┘       │
│                                    │                                   │
│                        ┌───────────▼───────────┐                      │
│                        │   Frontend Scripts    │                      │
│                        │   - app.js            │                      │
│                        │   - nav-user.js       │                      │
│                        └───────────┬───────────┘                      │
└────────────────────────────────────┼──────────────────────────────────┘
                                     │
                         HTTP/HTTPS  │  REST API Calls
                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                        API LAYER (Serverless)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Authentication  │  │   Predictions    │  │   Admin APIs     │    │
│  │  ──────────────  │  │  ──────────────  │  │  ──────────────  │    │
│  │  /auth/login     │  │  /predictions    │  │  /admin/users    │    │
│  │  /auth/register  │  │  /predictions/id │  │  /admin/stats    │    │
│  │  /auth/logout    │  │  /pred/id/       │  │  /admin/         │    │
│  │  /auth/me        │  │     feedback     │  │    predictions   │    │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘    │
│           │                     │                      │               │
│           └─────────────────────┼──────────────────────┘               │
│                                 │                                      │
│                    ┌────────────▼────────────┐                        │
│                    │  Shared Utilities       │                        │
│                    │  ──────────────────      │                        │
│                    │  • auth.js (JWT)        │                        │
│                    │  • db.js (PostgreSQL)   │                        │
│                    └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
┌───────────────────────┐         ┌──────────────────────────────────┐
│   DATA LAYER          │         │   EXTERNAL SERVICES              │
│  ───────────────────  │         │  ──────────────────────────────  │
│                       │         │                                  │
│  ┌─────────────────┐ │         │  ┌────────────────────────────┐ │
│  │   PostgreSQL    │ │         │  │   Azure OpenAI             │ │
│  │   Database      │ │         │  │   ─────────────────────    │ │
│  │   ───────────── │ │         │  │   • GPT-4 Vision Model     │ │
│  │                 │ │         │  │   • Image Analysis         │ │
│  │   Tables:       │ │         │  │   • Disease Detection      │ │
│  │   • users       │ │         │  │   • Endpoint: eastus2      │ │
│  │   • predictions │ │         │  │   • Deployment: gpt-5.4    │ │
│  │                 │ │         │  └────────────────────────────┘ │
│  └─────────────────┘ │         │                                  │
│                       │         │                                  │
└───────────────────────┘         └──────────────────────────────────┘
```

### Component Descriptions

#### 1. **Client Layer**
- **Static HTML Pages**: Landing page, authentication pages, detection interface, admin dashboard
- **Frontend Scripts**: Vanilla JavaScript for interactivity, Azure OpenAI integration
- **LocalStorage**: Client-side caching for user sessions and prediction history

#### 2. **API Layer (Serverless Functions)**
- **Vercel Serverless Functions**: All API endpoints deployed as serverless functions
- **Authentication Module**: JWT-based auth with 7-day token expiry
- **Prediction Module**: CRUD operations for disease predictions
- **Admin Module**: User management and system statistics

#### 3. **Data Layer**
- **PostgreSQL Database**: Hosted with SSL encryption
- **Connection Pooling**: Efficient database connection management

#### 4. **External Services**
- **Azure OpenAI**: GPT-4 Vision for image analysis and disease detection

---

## API Integration Flow

### Complete API Request Flow Diagram

```
┌──────────────┐
│   User       │
│   Browser    │
└──────┬───────┘
       │
       │ 1. User uploads crop image
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (app.js)                                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  handleFile() → base64Image encoding                     │ │
│  └────────────────────────────┬─────────────────────────────┘ │
│                                │                                │
│  ┌────────────────────────────▼─────────────────────────────┐ │
│  │  runDetection()                                          │ │
│  │  • Validates image                                       │ │
│  │  • Builds AI prompt with context                         │ │
│  │  • Shows loading state                                   │ │
│  └────────────────────────────┬─────────────────────────────┘ │
│                                │                                │
│  ┌────────────────────────────▼─────────────────────────────┐ │
│  │  callAzureVision(base64, description, cropType)         │ │
│  └────────────────────────────┬─────────────────────────────┘ │
└─────────────────────────────────┼──────────────────────────────┘
                                 │
                    2. POST Request to Azure OpenAI
                    Headers: api-key, Content-Type
                    Body: {messages, image_url, params}
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│  AZURE OPENAI SERVICE (External)                                 │
│  Endpoint: comsi-md4b9qgt-eastus2.cognitiveservices.azure.com   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  GPT-4 Vision Model (gpt-5.4-nano)                     │    │
│  │  ───────────────────────────────────────────────        │    │
│  │  • Analyzes crop image with high detail               │    │
│  │  • Identifies disease patterns                         │    │
│  │  • Calculates severity and confidence                  │    │
│  │  • Generates structured JSON response                 │    │
│  └────────────────────────────┬───────────────────────────┘    │
└─────────────────────────────────┼──────────────────────────────┘
                                 │
                    3. Returns JSON: {disease_name, disease_type,
                       severity, causes[], prevention[], etc}
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND RESPONSE HANDLING                                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  renderResults(data)                                     │ │
│  │  • Displays results with typing animation                │ │
│  │  • Shows disease details, causes, prevention             │ │
│  └────────────────────────────┬─────────────────────────────┘ │
│                                │                                │
│  ┌────────────────────────────▼─────────────────────────────┐ │
│  │  addToHistory(data, imageDataUrl)                       │ │
│  │  • Saves to localStorage (offline access)                │ │
│  │  • Calls backend API if user is logged in                │ │
│  └────────────────────────────┬─────────────────────────────┘ │
└─────────────────────────────────┼──────────────────────────────┘
                                 │
                    4. POST /api/predictions (if logged in)
                    Headers: Authorization: Bearer <token>
                    Body: {disease_name, disease_type, causes,
                          prevention, recommendations, image_data}
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND API (/api/predictions/index.js)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  verifyToken(req)                                        │ │
│  │  • Extracts JWT from Authorization header                │ │
│  │  • Validates token signature                             │ │
│  │  • Returns decoded user ID and role                      │ │
│  └────────────────────────────┬─────────────────────────────┘ │
│                                │                                │
│  ┌────────────────────────────▼─────────────────────────────┐ │
│  │  Database INSERT                                         │ │
│  │  • Stores prediction in PostgreSQL                       │ │
│  │  • Associates with user_id                               │ │
│  │  • Stores serialized arrays (causes, prevention, etc.)   │ │
│  └────────────────────────────┬─────────────────────────────┘ │
└─────────────────────────────────┼──────────────────────────────┘
                                 │
                    5. Returns: 201 Created {message: "Saved."}
                                 │
                                 ▼
┌──────────────┐
│   User       │
│   Browser    │
│              │
│   Results    │
│   Displayed  │
└──────────────┘
```

### Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Submits credentials (email/phone + password)
     │
     ▼
┌─────────────────────────────────────────────┐
│  POST /api/auth/login                       │
│  POST /api/auth/register                    │
└────────────────┬────────────────────────────┘
                 │
                 │ 2. Validates credentials
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  PostgreSQL Database Query                  │
│  • SELECT user by email/phone               │
│  • Compare passwords (plaintext)            │
└────────────────┬────────────────────────────┘
                 │
                 │ 3. User found & password matches
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  JWT Token Generation                       │
│  • Payload: {id, role}                      │
│  • Secret: JWT_SECRET                       │
│  • Expires: 7 days                          │
└────────────────┬────────────────────────────┘
                 │
                 │ 4. Returns {token, user{...}}
                 │
                 ▼
┌──────────────────────────────────────────────┐
│  Frontend: localStorage.setItem()           │
│  • Stores: cg_token                         │
│  • Stores: cg_user (user object)            │
└──────────────────────────────────────────────┘
```

### Subsequent Authenticated Requests

```
┌──────────┐
│  User    │
│  Action  │
└────┬─────┘
     │
     │ Includes: Authorization: Bearer <token>
     │
     ▼
┌─────────────────────────────────────────────┐
│  API Endpoint                               │
│  • verifyToken(req)                         │
│  • jwt.verify(token, JWT_SECRET)            │
└────────────────┬────────────────────────────┘
                 │
                 ├─── Valid? ───┐
                 │              │
           ┌─────▼──────┐  ┌────▼──────────┐
           │  Process   │  │  401          │
           │  Request   │  │  Unauthorized │
           └────────────┘  └───────────────┘
```

---

## Database Schema & Entity Relationships

### Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS TABLE                          │
├─────────────────────────────────────────────────────────────┤
│  PK  id                  SERIAL                             │
│      full_name           VARCHAR(255)  NOT NULL             │
│  UK  email               VARCHAR(255)  UNIQUE               │
│  UK  phone               VARCHAR(20)   UNIQUE               │
│      password            VARCHAR(255)  NOT NULL             │
│      farm_location       VARCHAR(255)                       │
│      primary_crops       TEXT                               │
│      role                VARCHAR(20)   DEFAULT 'farmer'     │
│      registered_at       TIMESTAMP     DEFAULT NOW()        │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ 1:N Relationship
               │ (One user can have many predictions)
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                    PREDICTIONS TABLE                        │
├─────────────────────────────────────────────────────────────┤
│  PK  id                  SERIAL                             │
│  FK  user_id             INTEGER       REFERENCES users(id) │
│                                        ON DELETE CASCADE     │
│      crop_type           VARCHAR(100)                       │
│      disease_name        VARCHAR(255)                       │
│      disease_type        VARCHAR(100)                       │
│      causes              TEXT          (JSON array string)  │
│      prevention          TEXT          (JSON array string)  │
│      future              TEXT          (JSON array string)  │
│      recommendations     TEXT                               │
│      image_data          TEXT          (Base64 encoded)      │
│      feedback            VARCHAR(20)   (helpful/not_helpful)│
│      created_at          TIMESTAMP     DEFAULT NOW()        │
└─────────────────────────────────────────────────────────────┘

Indexes:
  • idx_predictions_user_id ON predictions(user_id)
  • idx_predictions_created_at ON predictions(created_at DESC)
```

### Database Schema Details

#### **USERS Table**
Stores user account information for farmers and administrators.

| Column         | Type         | Constraints           | Description                        |
|----------------|--------------|----------------------|------------------------------------|
| id             | SERIAL       | PRIMARY KEY          | Auto-incrementing user ID          |
| full_name      | VARCHAR(255) | NOT NULL             | User's full name                   |
| email          | VARCHAR(255) | UNIQUE               | Email address (optional)           |
| phone          | VARCHAR(20)  | UNIQUE               | Phone number (optional)            |
| password       | VARCHAR(255) | NOT NULL             | Plain text password (⚠️ see note)  |
| farm_location  | VARCHAR(255) | NULL                 | Farm location description          |
| primary_crops  | TEXT         | NULL                 | Main crops grown by farmer         |
| role           | VARCHAR(20)  | DEFAULT 'farmer'     | User role (farmer/admin)           |
| registered_at  | TIMESTAMP    | DEFAULT NOW()        | Account creation timestamp         |

**Constraints:**
- At least one of `email` or `phone` must be provided
- Unique constraint on both email and phone


#### **PREDICTIONS Table**
Stores disease detection results and analysis history.

| Column          | Type         | Constraints              | Description                           |
|-----------------|--------------|--------------------------|---------------------------------------|
| id              | SERIAL       | PRIMARY KEY              | Auto-incrementing prediction ID       |
| user_id         | INTEGER      | FOREIGN KEY → users(id)  | Reference to user who made prediction |
| crop_type       | VARCHAR(100) | NULL                     | Type of crop analyzed                 |
| disease_name    | VARCHAR(255) | NULL                     | Identified disease name               |
| disease_type    | VARCHAR(100) | NULL                     | Category (Fungal, Viral, etc.)        |
| causes          | TEXT         | NULL                     | JSON array of disease causes          |
| prevention      | TEXT         | NULL                     | JSON array of prevention measures     |
| future          | TEXT         | NULL                     | JSON array of future avoidance tips   |
| recommendations | TEXT         | NULL                     | Expert recommendations paragraph      |
| image_data      | TEXT         | NULL                     | Base64 encoded crop image             |
| feedback        | VARCHAR(20)  | NULL                     | User feedback (helpful/not_helpful)   |
| created_at      | TIMESTAMP    | DEFAULT NOW()            | Prediction creation timestamp         |

**Relationships:**
- `user_id` → `users.id` with `ON DELETE CASCADE` (deleting user removes their predictions)

---

## Technology Stack

### Frontend
- **HTML5, CSS3**: Semantic markup and modern styling
- **Vanilla JavaScript**: No framework dependencies
- **LocalStorage API**: Client-side data persistence
- **Fetch API**: HTTP requests to backend and Azure OpenAI
- **FileReader API**: Image file processing and base64 encoding

### Backend
- **Node.js**: JavaScript runtime
- **Vercel Serverless Functions**: API hosting
- **jsonwebtoken (v9.0.3)**: JWT authentication
- **pg (v8.20.0)**: PostgreSQL client
- **dotenv (v17.4.2)**: Environment variable management

### Database
- **PostgreSQL**: Relational database with SSL support
- **Connection Pooling**: Optimized database connections

### AI/ML Services
- **Azure OpenAI Service**
  - Model: GPT-4 Vision (gpt-5.4-nano)
  - Endpoint: eastus2 region
  - API Version: 2024-12-01-preview
  - Max tokens: 1000
  - Temperature: 0.2 (deterministic responses)

### Deployment
- **Vercel**: Frontend and serverless API hosting
- **PostgreSQL**: Managed database service (SSL enabled)

---

## Security Considerations

### Current Implementation
✅ **Implemented:**
- JWT-based authentication with 7-day expiration
- CORS headers on all API endpoints
- SSL/TLS for database connections
- Token-based authorization on protected endpoints
- Role-based access control (farmer/admin)
- Input validation on file uploads (type, size limits)
- API key protection via environment variables

⚠️ **Security Improvements Needed:**
- **Password Hashing**: Currently storing passwords in plain text. Should implement bcrypt/argon2
- **Rate Limiting**: No current protection against API abuse
- **Input Sanitization**: Add SQL injection protection (parameterized queries are used but needs validation)
- **HTTPS Only**: Enforce HTTPS in production
- **Content Security Policy**: Add CSP headers
- **Azure API Key Exposure**: Currently hardcoded in frontend (`app.js`), should move to backend proxy

### Recommendations
1. Implement bcrypt for password hashing with salt rounds ≥ 10
2. Add rate limiting middleware (e.g., express-rate-limit)
3. Move Azure OpenAI calls to backend API endpoint
4. Implement request validation using Joi or Zod
5. Add CSRF protection for state-changing operations
6. Implement secure session management
7. Add logging and monitoring for security events

---

## Deployment Architecture

### Production Environment (Vercel)

```
┌────────────────────────────────────────────────────────────────┐
│                    CDN / Edge Network (Vercel)                 │
│  • Global content delivery                                     │
│  • SSL/TLS termination                                         │
│  • DDoS protection                                             │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│              Static Assets (HTML, CSS, JS, Images)             │
│  • Served from edge locations                                  │
│  • Cached for fast delivery                                    │
│  Files: index.html, detection.html, admin.html, app.js, etc.  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│            Serverless Functions (Auto-scaling)                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  /api/*                                                  │ │
│  │  • Cold start: ~100-300ms                                │ │
│  │  • Warm execution: ~50-100ms                             │ │
│  │  • Region: Auto-selected based on user location          │ │
│  │  • Timeout: 10 seconds (Vercel default)                  │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           │ PostgreSQL Connection
                           │ (SSL/TLS encrypted)
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Managed)                     │
│  • Connection pooling enabled                                  │
│  • Automated backups                                           │
│  • SSL required                                                │
│  • Replication for high availability                           │
└────────────────────────────────────────────────────────────────┘
```

### External Service Integration

```
Frontend (Browser)
       │
       │ HTTPS Request
       │ + Base64 Image
       │ + AI Prompt
       │
       ▼
┌─────────────────────────────────────────┐
│  Azure OpenAI Service                   │
│  Endpoint: eastus2                      │
│  ───────────────────────────────────    │
│                                         │
│  • Load balancing                       │
│  • Rate limiting (TPM/RPM)              │
│  • Request throttling                   │
│  • Response caching                     │
│                                         │
│  Model: gpt-5.4-nano                    │
│  • Vision capabilities                  │
│  • JSON mode output                     │
│  • 1000 max tokens                      │
│  • Temperature: 0.2                     │
└─────────────────────────────────────────┘
```

### Environment Variables

Required environment variables for deployment:

```bash
# Database Configuration
DB_HOST=<postgres-host>
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<database-password>

# JWT Configuration
JWT_SECRET=<secure-random-string>

# Azure OpenAI (⚠️ Currently in frontend, should move to backend)
AZURE_API_KEY=<azure-openai-api-key>
AZURE_ENDPOINT=https://comsi-md4b9qgt-eastus2.cognitiveservices.azure.com
AZURE_DEPLOYMENT=gpt-5.4-nano
AZURE_API_VERSION=2024-12-01-preview
```

---

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint           | Auth Required | Description                    |
|--------|-------------------|---------------|--------------------------------|
| POST   | /api/auth/register | No           | Create new user account        |
| POST   | /api/auth/login    | No           | Login with email/phone         |
| POST   | /api/auth/logout   | Yes          | Logout (client-side token clear)|
| GET    | /api/auth/me       | Yes          | Get current user info          |

### Prediction Endpoints

| Method | Endpoint                      | Auth Required | Description                    |
|--------|------------------------------|---------------|--------------------------------|
| GET    | /api/predictions             | Yes          | Get user's prediction history   |
| POST   | /api/predictions             | Yes          | Save new prediction            |
| GET    | /api/predictions/[id]        | Yes          | Get specific prediction        |
| DELETE | /api/predictions/[id]        | Yes          | Delete prediction              |
| POST   | /api/predictions/[id]/feedback| Yes         | Submit feedback on prediction  |

### Admin Endpoints

| Method | Endpoint                     | Auth Required | Role    | Description                    |
|--------|------------------------------|---------------|---------|--------------------------------|
| GET    | /api/admin/users             | Yes          | Admin   | List all users                 |
| GET    | /api/admin/stats             | Yes          | Admin   | Get system statistics          |
| GET    | /api/admin/predictions       | Yes          | Admin   | List all predictions           |
| POST   | /api/admin/promote/[id]      | Yes          | Admin   | Promote user to admin          |

### Health Check

| Method | Endpoint       | Auth Required | Description                    |
|--------|---------------|---------------|--------------------------------|
| GET    | /api/health   | No           | API health status              |

---

## Data Flow Examples

### Example 1: User Registration

```
1. User fills registration form (name, email, password, etc.)
2. Frontend → POST /api/auth/register
3. Backend validates input and checks for duplicates
4. INSERT new user into PostgreSQL users table
5. Generate JWT token with {id, role: 'farmer'}
6. Return {token, user} to frontend
7. Frontend stores token in localStorage as 'cg_token'
8. Frontend stores user object in localStorage as 'cg_user'
9. User is redirected to detection page
```

### Example 2: Disease Detection (Logged In User)

```
1. User uploads crop image on detection.html
2. Image converted to base64
3. Frontend → Azure OpenAI (direct call with api-key)
4. Azure analyzes image and returns JSON diagnosis
5. Frontend displays results with typing animation
6. Frontend → POST /api/predictions (with Authorization: Bearer token)
7. Backend verifies JWT token
8. Backend saves prediction to PostgreSQL
9. Frontend also saves to localStorage for offline access
10. User can download PDF report
11. User can submit feedback (helpful/not_helpful)
```

### Example 3: Admin Viewing Statistics

```
1. Admin logs in with admin role
2. Navigates to admin.html
3. Frontend → GET /api/admin/stats (with Authorization header)
4. Backend verifies token and checks role === 'admin'
5. Backend queries database:
   - COUNT(*) FROM users WHERE role='farmer'
   - COUNT(*) FROM predictions
   - COUNT(*) FROM predictions WHERE feedback IS NOT NULL
6. Return aggregated statistics
7. Frontend displays in dashboard cards
```

---

## Performance Considerations

### Optimization Strategies

1. **Frontend**
   - LocalStorage caching for prediction history
   - Image compression before upload (max 10MB)
   - Lazy loading for images in history
   - CSS animations instead of JavaScript where possible
   - Debouncing for search/filter operations

2. **Backend**
   - Database connection pooling
   - Serverless auto-scaling
   - Edge network delivery via Vercel CDN
   - Efficient SQL queries with proper indexing

3. **Azure OpenAI**
   - Temperature set to 0.2 for consistent, faster responses
   - Max tokens limited to 1000
   - "high" detail level for accurate image analysis

### Expected Performance Metrics

| Operation                  | Expected Time    | Notes                          |
|----------------------------|------------------|--------------------------------|
| Page load (initial)        | < 2 seconds      | Static assets from CDN         |
| User login/registration    | 200-500ms        | Database query + JWT generation|
| Azure OpenAI analysis      | 4-8 seconds      | Depends on image complexity    |
| Prediction save to DB      | 100-300ms        | Simple INSERT operation        |
| History load (50 items)    | 300-600ms        | Database query + serialization |
| PDF generation             | 1-2 seconds      | Client-side rendering          |

---

## Future Enhancements

### Planned Improvements

1. **Security**
   - Implement bcrypt password hashing
   - Move Azure OpenAI calls to backend proxy
   - Add rate limiting and request throttling
   - Implement refresh tokens for better session management

2. **Features**
   - Multi-language support (i18n)
   - Mobile app (React Native / Flutter)
   - Real-time notifications for disease outbreaks
   - Weather integration for predictive analysis
   - Community forum for farmers
   - Export history to CSV/Excel

3. **Performance**
   - Implement Redis caching for frequent queries
   - Database read replicas for scaling
   - Image CDN for user-uploaded images
   - Progressive Web App (PWA) capabilities

4. **Analytics**
   - Disease trend analysis dashboard
   - Geographic disease mapping
   - Seasonal pattern detection
   - Treatment effectiveness tracking

---

## Conceptual Architecture

### Three-Tier Architecture Model

```
┌───────────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER (Client)                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  User Interface Layer                                       │ │
│  │  • HTML5 Pages (Landing, Auth, Detection, Admin)            │ │
│  │  • CSS3 Styling (Responsive Design)                         │ │
│  │  • JavaScript Application Logic                             │ │
│  │  • LocalStorage for Client State                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬─────────────────────────────────────┘
                              │
                    REST API / HTTPS
                              │
┌─────────────────────────────▼─────────────────────────────────────┐
│                   APPLICATION TIER (Business Logic)               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Serverless Functions (Node.js)                             │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐│ │
│  │  │ Auth Service   │  │ Prediction     │  │ Admin Service ││ │
│  │  │ ────────────── │  │ Service        │  │ ───────────── ││ │
│  │  │ • Registration │  │ ──────────────  │  │ • User Mgmt   ││ │
│  │  │ • Login/Logout │  │ • Create       │  │ • Statistics  ││ │
│  │  │ • Token Gen    │  │ • Read         │  │ • Promotion   ││ │
│  │  │ • JWT Verify   │  │ • Update       │  │ • Monitoring  ││ │
│  │  └────────────────┘  │ • Delete       │  └───────────────┘│ │
│  │                      │ • Feedback     │                    │ │
│  │                      └────────────────┘                    │ │
│  │                                                             │ │
│  │  ┌────────────────────────────────────────────────────┐   │ │
│  │  │  Shared Utilities & Middleware                     │   │ │
│  │  │  • JWT Authentication (auth.js)                    │   │ │
│  │  │  • Database Connection Pool (db.js)                │   │ │
│  │  │  • CORS Configuration                              │   │ │
│  │  │  • Error Handling                                  │   │ │
│  │  └────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────┬─────────────────────────┘
                              │           │
                   PostgreSQL │           │ HTTPS API
                              │           │
┌─────────────────────────────┴───────────┐ ┌─────────────────────────┐
│         DATA TIER (Storage)             │ │  EXTERNAL AI SERVICE    │
│  ┌───────────────────────────────────┐  │ │  ┌───────────────────┐ │
│  │  PostgreSQL Database (Managed)    │  │ │  │  Azure OpenAI     │ │
│  │  ───────────────────────────────  │  │ │  │  ───────────────  │ │
│  │  Tables:                          │  │ │  │  • GPT-4 Vision   │ │
│  │  ┌─────────────────────────────┐ │  │ │  │  • Image Analysis │ │
│  │  │  users                      │ │  │ │  │  • JSON Output    │ │
│  │  │  • User accounts            │ │  │ │  │  • eastus2 Region │ │
│  │  │  • Authentication data      │ │  │ │  └───────────────────┘ │
│  │  │  • Profile information      │ │  │ └─────────────────────────┘
│  │  └─────────────────────────────┘ │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │  predictions                │ │  │
│  │  │  • Detection results        │ │  │
│  │  │  • Disease data             │ │  │
│  │  │  • Image data (Base64)      │ │  │
│  │  │  • User feedback            │ │  │
│  │  └─────────────────────────────┘ │  │
│  │                                   │  │
│  │  Features:                        │  │
│  │  • Connection pooling             │  │
│  │  • SSL/TLS encryption             │  │
│  │  • Automated backups              │  │
│  │  • Foreign key constraints        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Activity Diagram

### Disease Detection Activity Flow

```
                    ┌─────────────┐
                    │   START     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────────────────────┐
                    │  User Opens Detection Page  │
                    └──────┬──────────────────────┘
                           │
                    ┌──────▼──────────────────┐
                    │  Select/Drop Image File │
                    └──────┬──────────────────┘
                           │
                    ┌──────▼──────────┐
                    │ Validate Image  │
                    └──────┬──────────┘
                           │
                  ┌────────┴────────┐
                  │                 │
         ┌────────▼────────┐   ┌───▼──────────────┐
         │  Valid Image?   │   │  Invalid Format  │
         │  (Type & Size)  │   │  or Size         │
         └────────┬────────┘   └───┬──────────────┘
                  │ Yes            │
                  │                │ Show Error
                  │                └──────┐
         ┌────────▼────────────┐         │
         │  Convert to Base64  │         │
         └────────┬────────────┘         │
                  │                      │
         ┌────────▼──────────────────┐   │
         │  Display Image Preview    │   │
         └────────┬──────────────────┘   │
                  │                      │
         ┌────────▼──────────────────────────┐
         │  User Optionally Enters:          │
         │  • Crop Type                      │
         │  • Additional Description         │
         └────────┬──────────────────────────┘
                  │
         ┌────────▼────────────────┐
         │  Click "Analyse Crop"   │
         └────────┬────────────────┘
                  │
         ┌────────▼────────────────┐
         │  Show Loading State     │
         │  (Scanning Animation)   │
         └────────┬────────────────┘
                  │
         ┌────────▼──────────────────────────┐
         │  Build AI Prompt with Context     │
         │  • Include disease name            │
         │  • Include crop type if provided   │
         │  • Include description if provided │
         └────────┬──────────────────────────┘
                  │
         ┌────────▼──────────────────────────┐
         │  Call Azure OpenAI API            │
         │  POST with Base64 Image + Prompt  │
         └────────┬──────────────────────────┘
                  │
         ┌────────▼──────────────┐
         │  Wait for AI Response │
         │  (4-8 seconds)        │
         └────────┬──────────────┘
                  │
         ┌────────┴────────┐
         │                 │
┌────────▼────────┐   ┌────▼──────────┐
│  Success        │   │  API Error    │
└────────┬────────┘   └────┬──────────┘
         │                 │
         │                 │ Show Error
         │                 │ Allow Retry
         │                 └────────┐
         │                          │
┌────────▼──────────────────────────────┐  │
│  Parse JSON Response                  │  │
│  • disease_name                       │  │
│  • disease_type                       │  │
│  • severity, confidence               │  │
│  • causes[], prevention[], future[]   │  │
│  • recommendations                    │  │
└────────┬──────────────────────────────┘  │
         │                                  │
┌────────▼──────────────────────────┐      │
│  Display Results with Animation   │      │
│  • Typing effect for text         │      │
│  • Progressive reveal of sections │      │
└────────┬──────────────────────────┘      │
         │                                  │
┌────────▼──────────────┐                  │
│  Check User Login     │                  │
└────────┬──────────────┘                  │
         │                                  │
    ┌────┴────┐                            │
    │         │                            │
┌───▼────┐ ┌──▼────────┐                  │
│Logged  │ │ Not       │                  │
│In?     │ │ Logged In │                  │
└───┬────┘ └──┬────────┘                  │
    │ Yes     │                            │
    │         │ Skip DB Save               │
    │         └────────────┐               │
┌───▼──────────────────┐   │               │
│ Save to Database     │   │               │
│ POST /api/predictions│   │               │
└───┬──────────────────┘   │               │
    │                      │               │
    └──────────┬───────────┘               │
               │                           │
┌──────────────▼──────────────┐            │
│  Save to LocalStorage       │            │
│  (Offline Access)           │            │
└──────────────┬──────────────┘            │
               │                           │
┌──────────────▼──────────────────────┐    │
│  User Options:                      │    │
│  ┌────────────────────────────────┐ │    │
│  │  1. Download PDF Report        │ │    │
│  └────────────────────────────────┘ │    │
│  ┌────────────────────────────────┐ │    │
│  │  2. Submit Feedback            │ │    │
│  │     (Helpful / Not Helpful)    │ │    │
│  └────────────────────────────────┘ │    │
│  ┌────────────────────────────────┐ │    │
│  │  3. Analyze Another Crop       │ │    │
│  └────────────────────────────────┘ │    │
│  ┌────────────────────────────────┐ │    │
│  │  4. View History               │ │    │
│  └────────────────────────────────┘ │    │
└──────────────┬──────────────────────┘    │
               │                           │
          ┌────┴────┐                      │
          │         │                      │
     ┌────▼───┐ ┌───▼──────┐              │
     │  END   │ │  RESET   │◄─────────────┘
     └────────┘ │ & RETRY  │
                └──────────┘
```

---

## Sequence Diagram

### User Authentication Sequence

```
Actor: User    Frontend    Auth API    Database    JWT Service
  │               │           │           │            │
  │──Register────▶│           │           │            │
  │   Form Data   │           │           │            │
  │               │           │           │            │
  │               │──POST────▶│           │            │
  │               │ /register │           │            │
  │               │  {email,  │           │            │
  │               │ password} │           │            │
  │               │           │           │            │
  │               │           │──Query───▶│            │
  │               │           │ Check     │            │
  │               │           │ Duplicate │            │
  │               │           │           │            │
  │               │           │◀─Result──│            │
  │               │           │  (None)   │            │
  │               │           │           │            │
  │               │           │──INSERT──▶│            │
  │               │           │  New User │            │
  │               │           │           │            │
  │               │           │◀─User────│            │
  │               │           │   Data    │            │
  │               │           │           │            │
  │               │           │───────────────Sign────▶│
  │               │           │      {id, role}        │
  │               │           │                        │
  │               │           │◀──────────Token────────│
  │               │           │    (7 day expiry)      │
  │               │           │                        │
  │               │◀─Response─│                        │
  │               │  {token,  │                        │
  │               │   user}   │                        │
  │               │           │                        │
  │◀──Success────│           │                        │
  │   Store Token │           │                        │
  │  localStorage │           │                        │
  │               │           │                        │
```

### Disease Detection Sequence

```
User   Frontend   Azure OpenAI   Backend API   Database
 │         │            │             │            │
 │─Upload─▶│            │             │            │
 │  Image  │            │             │            │
 │         │            │             │            │
 │         │──Encode───▶│             │            │
 │         │  Base64    │             │            │
 │         │            │             │            │
 │─Click──▶│            │             │            │
 │ Analyze │            │             │            │
 │         │            │             │            │
 │         │──POST─────▶│             │            │
 │         │  {image,   │             │            │
 │         │   prompt}  │             │            │
 │         │            │             │            │
 │         │            │──Process───▶│            │
 │         │            │  Vision AI  │            │
 │         │            │  (4-8 sec)  │            │
 │         │            │             │            │
 │         │            │◀──JSON──────│            │
 │         │            │  {disease,  │            │
 │         │            │   details}  │            │
 │         │            │             │            │
 │         │◀──Result───│             │            │
 │         │            │             │            │
 │         │──Display──▶│             │            │
 │◀─Show──│  Results   │             │            │
 │ Results │            │             │            │
 │         │            │             │            │
 │         │──POST──────────────────▶│            │
 │         │  /api/predictions       │            │
 │         │  Bearer Token           │            │
 │         │  {disease_data}         │            │
 │         │                         │            │
 │         │                         │──Verify───▶│
 │         │                         │   Token    │
 │         │                         │            │
 │         │                         │──INSERT───▶│
 │         │                         │ Prediction │
 │         │                         │            │
 │         │                         │◀──Success──│
 │         │                         │            │
 │         │◀────201 Created─────────│            │
 │         │                         │            │
 │◀Confirm─│                         │            │
 │  Saved  │                         │            │
 │         │                         │            │
```

### Admin Statistics Retrieval Sequence

```
Admin   Frontend   Admin API   Auth Module   Database
  │         │          │            │            │
  │─Login──▶│          │            │            │
  │  as     │          │            │            │
  │  Admin  │          │            │            │
  │         │          │            │            │
  │         │──────────────────────────────────▶│
  │         │  Authenticate (see auth sequence) │
  │         │◀────Token (role: admin)────────────│
  │         │                                    │
  │─View───▶│                                    │
  │  Stats  │                                    │
  │         │                                    │
  │         │──GET────▶│                         │
  │         │ /admin/  │                         │
  │         │  stats   │                         │
  │         │  Bearer  │                         │
  │         │  Token   │                         │
  │         │          │                         │
  │         │          │──Verify──▶│             │
  │         │          │   Token   │             │
  │         │          │           │             │
  │         │          │◀──Valid──│             │
  │         │          │  {id,role}│             │
  │         │          │           │             │
  │         │          │─────Check────┐          │
  │         │          │   role ==    │          │
  │         │          │   'admin'    │          │
  │         │          │◀─────────────┘          │
  │         │          │                         │
  │         │          │──Query──────────────────▶│
  │         │          │  COUNT users            │
  │         │          │                         │
  │         │          │◀─Result─────────────────│
  │         │          │  total_farmers          │
  │         │          │                         │
  │         │          │──Query──────────────────▶│
  │         │          │  COUNT predictions      │
  │         │          │                         │
  │         │          │◀─Result─────────────────│
  │         │          │  total_predictions      │
  │         │          │                         │
  │         │          │──Query──────────────────▶│
  │         │          │  COUNT feedback         │
  │         │          │                         │
  │         │          │◀─Result─────────────────│
  │         │          │  total_feedback         │
  │         │          │                         │
  │         │◀─200 OK──│                         │
  │         │  {stats} │                         │
  │         │          │                         │
  │◀Display─│          │                         │
  │  Stats  │          │                         │
  │  Cards  │          │                         │
  │         │          │                         │
```

---

## Class Diagram

### Backend System Classes

```
┌──────────────────────────────────────────┐
│              <<Module>>                  │
│           DatabasePool                   │
├──────────────────────────────────────────┤
│ - pool: Pool                             │
│ - config: DatabaseConfig                 │
├──────────────────────────────────────────┤
│ + getPool(): Pool                        │
│ + query(sql: string, params: any[]): Result │
│ + connect(): Connection                  │
│ + end(): void                            │
└──────────────────────┬───────────────────┘
                       │ uses
                       │
        ┌──────────────┴────────────────┐
        │                               │
┌───────▼──────────────────┐  ┌─────────▼─────────────────┐
│    <<Module>>            │  │    <<Module>>             │
│    AuthService           │  │    DatabaseConfig         │
├──────────────────────────┤  ├───────────────────────────┤
│ - JWT_SECRET: string     │  │ + host: string            │
├──────────────────────────┤  │ + database: string        │
│ + verifyToken(req):      │  │ + user: string            │
│      DecodedToken | null │  │ + password: string        │
│ + generateToken(payload):│  │ + port: number            │
│      string              │  │ + ssl: SSLConfig          │
│ + hashPassword(pwd):     │  └───────────────────────────┘
│      string              │
│ + comparePassword():     │
│      boolean             │
└──────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│                    <<Entity>>                           │
│                      User                               │
├─────────────────────────────────────────────────────────┤
│ + id: number (PK)                                       │
│ + full_name: string                                     │
│ + email: string (UNIQUE)                                │
│ + phone: string (UNIQUE)                                │
│ + password: string                                      │
│ + farm_location: string?                                │
│ + primary_crops: string?                                │
│ + role: 'farmer' | 'admin'                              │
│ + registered_at: Date                                   │
├─────────────────────────────────────────────────────────┤
│ + authenticate(password: string): boolean               │
│ + generateToken(): string                               │
│ + toJSON(): SafeUser                                    │
└──────────────────┬──────────────────────────────────────┘
                   │ 1
                   │
                   │ has many
                   │
                   │ *
┌──────────────────▼──────────────────────────────────────┐
│                    <<Entity>>                           │
│                   Prediction                            │
├─────────────────────────────────────────────────────────┤
│ + id: number (PK)                                       │
│ + user_id: number (FK → User.id)                        │
│ + crop_type: string?                                    │
│ + disease_name: string                                  │
│ + disease_type: string                                  │
│ + causes: string[] (stored as JSON)                     │
│ + prevention: string[] (stored as JSON)                 │
│ + future: string[] (stored as JSON)                     │
│ + recommendations: string                               │
│ + image_data: string (Base64)                           │
│ + feedback: 'helpful' | 'not_helpful' | null            │
│ + created_at: Date                                      │
├─────────────────────────────────────────────────────────┤
│ + toJSON(): PredictionDTO                               │
│ + parseCauses(): string[]                               │
│ + parsePrevention(): string[]                           │
│ + parseFuture(): string[]                               │
│ + addFeedback(value: string): void                      │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│               <<API Handler>>                           │
│              AuthController                             │
├─────────────────────────────────────────────────────────┤
│ + register(req, res): Promise<Response>                 │
│ + login(req, res): Promise<Response>                    │
│ + logout(req, res): Promise<Response>                   │
│ + getCurrentUser(req, res): Promise<Response>           │
├─────────────────────────────────────────────────────────┤
│ - validateCredentials(email, pwd): boolean              │
│ - checkDuplicateUser(email, phone): Promise<boolean>    │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│               <<API Handler>>                           │
│           PredictionController                          │
├─────────────────────────────────────────────────────────┤
│ + getAllPredictions(req, res): Promise<Response>        │
│ + getPredictionById(req, res): Promise<Response>        │
│ + createPrediction(req, res): Promise<Response>         │
│ + deletePrediction(req, res): Promise<Response>         │
│ + submitFeedback(req, res): Promise<Response>           │
├─────────────────────────────────────────────────────────┤
│ - verifyOwnership(userId, predId): Promise<boolean>     │
│ - validatePredictionData(data): boolean                 │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│               <<API Handler>>                           │
│             AdminController                             │
├─────────────────────────────────────────────────────────┤
│ + getAllUsers(req, res): Promise<Response>              │
│ + getStatistics(req, res): Promise<Response>            │
│ + getAllPredictions(req, res): Promise<Response>        │
│ + promoteUser(req, res): Promise<Response>              │
├─────────────────────────────────────────────────────────┤
│ - requireAdmin(req): boolean                            │
│ - aggregateStats(): Promise<Statistics>                 │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│             <<External Service>>                        │
│            AzureOpenAIClient                            │
├─────────────────────────────────────────────────────────┤
│ - endpoint: string                                      │
│ - apiKey: string                                        │
│ - deployment: string                                    │
│ - apiVersion: string                                    │
├─────────────────────────────────────────────────────────┤
│ + analyzeCropImage(base64, prompt): Promise<AIResponse> │
│ + buildPrompt(desc, crop): string                       │
├─────────────────────────────────────────────────────────┤
│ - sendRequest(body): Promise<Response>                  │
│ - parseResponse(raw): DiagnosisResult                   │
└─────────────────────────────────────────────────────────┘
```

### Frontend System Classes

```
┌─────────────────────────────────────────────────────────┐
│              <<Frontend Class>>                         │
│             DetectionManager                            │
├─────────────────────────────────────────────────────────┤
│ - selectedFile: File?                                   │
│ - base64Image: string?                                  │
│ - currentState: 'empty'|'loading'|'results'             │
├─────────────────────────────────────────────────────────┤
│ + handleFile(file: File): void                          │
│ + validateImage(file: File): boolean                    │
│ + convertToBase64(file: File): Promise<string>          │
│ + runDetection(): Promise<void>                         │
│ + resetDetection(): void                                │
│ + showState(state: string): void                        │
└──────────────────┬──────────────────────────────────────┘
                   │ uses
                   │
┌──────────────────▼──────────────────────────────────────┐
│              <<Frontend Class>>                         │
│             AzureVisionClient                           │
├─────────────────────────────────────────────────────────┤
│ - AZURE_URL: string                                     │
│ - AZURE_API_KEY: string                                 │
├─────────────────────────────────────────────────────────┤
│ + callAzureVision(base64, desc, crop): Promise<Result>  │
│ + buildPrompt(desc, crop): string                       │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│              <<Frontend Class>>                         │
│              ResultsRenderer                            │
├─────────────────────────────────────────────────────────┤
│ + renderResults(data: DiagnosisResult): Promise<void>   │
│ + typeText(el: Element, text: string): Promise<void>    │
│ + typeListItems(ul: Element, items: []): Promise<void>  │
│ + revealSection(sectionId: string): Promise<void>       │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│              <<Frontend Class>>                         │
│             HistoryManager                              │
├─────────────────────────────────────────────────────────┤
│ - HISTORY_KEY: string = 'cropguard_history'            │
├─────────────────────────────────────────────────────────┤
│ + loadHistory(): Prediction[]                           │
│ + saveHistory(history: Prediction[]): void              │
│ + addToHistory(data, image): Promise<void>              │
│ + renderHistory(): Promise<void>                        │
│ + deleteHistoryEntry(id: number): Promise<void>         │
│ + clearHistory(): Promise<void>                         │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│              <<Frontend Class>>                         │
│              PDFGenerator                               │
├─────────────────────────────────────────────────────────┤
│ + downloadPDF(): void                                   │
│ + downloadPDFFromHistory(id: number): void              │
│ + generateAndDownloadPDF(entry, window): void           │
│ + buildPDFContent(entry): string                        │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│              <<Frontend Class>>                         │
│              APIClient                                  │
├─────────────────────────────────────────────────────────┤
│ - baseURL: string                                       │
├─────────────────────────────────────────────────────────┤
│ + getToken(): string?                                   │
│ + setAuthHeader(): Headers                              │
│ + login(credentials): Promise<AuthResponse>             │
│ + register(data): Promise<AuthResponse>                 │
│ + getPredictions(): Promise<Prediction[]>               │
│ + savePrediction(data): Promise<void>                   │
│ + submitFeedback(id, value): Promise<void>              │
└─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│              <<Data Transfer Object>>                   │
│              DiagnosisResult                            │
├─────────────────────────────────────────────────────────┤
│ + disease_name: string                                  │
│ + disease_type: string                                  │
│ + severity: string                                      │
│ + severity_percent: number                              │
│ + confidence_percent: number                            │
│ + causes: string[]                                      │
│ + prevention_measures: string[]                         │
│ + future_avoidance: string[]                            │
│ + recommendations: string                               │
└─────────────────────────────────────────────────────────┘
```

---

## Glossary

| Term              | Definition                                                                 |
|-------------------|---------------------------------------------------------------------------|
| **JWT**           | JSON Web Token - A compact, URL-safe token for authentication            |
| **Base64**        | Binary-to-text encoding scheme for representing binary data               |
| **CORS**          | Cross-Origin Resource Sharing - HTTP header-based mechanism               |
| **SSL/TLS**       | Secure Sockets Layer / Transport Layer Security - Encryption protocols    |
| **CRUD**          | Create, Read, Update, Delete - Basic database operations                  |
| **CDN**           | Content Delivery Network - Distributed server network                     |
| **Azure OpenAI**  | Microsoft's cloud-based AI service powered by OpenAI models               |
| **PostgreSQL**    | Open-source relational database management system                         |
| **Serverless**    | Cloud execution model where server management is abstracted               |
| **Vercel**        | Cloud platform for static sites and serverless functions                  |

---

## References

- **Azure OpenAI Documentation**: [https://learn.microsoft.com/azure/ai-services/openai/](https://learn.microsoft.com/azure/ai-services/openai/)
- **PostgreSQL Documentation**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
- **JWT Specification**: [https://datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519)
- **Vercel Documentation**: [https://vercel.com/docs](https://vercel.com/docs)
- **Node.js pg Library**: [https://node-postgres.com/](https://node-postgres.com/)

---

## Document Version History

| Version | Date         | Author    | Changes                                          |
|---------|--------------|-----------|--------------------------------------------------|
| 1.0.0   | July 7, 2026 | System    | Initial documentation with all diagrams          |

---

**END OF DOCUMENT**
