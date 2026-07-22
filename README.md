# 🌿 CropGuard AI - AI-Driven Crop Disease Detection & Prevention

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-13%2B-blue.svg)](https://www.postgresql.org/)
[![Azure OpenAI](https://img.shields.io/badge/Azure%20OpenAI-GPT--4%20Vision-orange.svg)](https://azure.microsoft.com/en-us/products/ai-services/openai-service)

> An intelligent web application that leverages Azure OpenAI's GPT-4 Vision to detect and diagnose crop diseases from images, providing farmers with actionable insights for prevention and treatment.

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Security Considerations](#-security-considerations)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## ✨ Features

### Core Features
- 🔍 **AI-Powered Disease Detection** - Upload crop images and get instant disease diagnosis using GPT-4 Vision
- 📊 **Comprehensive Analysis** - Detailed reports including disease type, severity, causes, and prevention measures
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 📄 **PDF Report Generation** - Download detailed analysis reports for offline reference
- 📚 **History Tracking** - Maintain a complete history of all disease detections
- 💬 **Feedback System** - Rate predictions to improve system accuracy
- 🔐 **User Authentication** - Secure JWT-based authentication system
- 👥 **Role-Based Access** - Separate interfaces for farmers and administrators
- 💾 **Offline Support** - LocalStorage caching for offline access to history

### User Types
- **Farmers**: Upload crop images, view analysis, track history, download reports
- **Administrators**: Manage users, view system statistics, monitor predictions

## 🎬 Demo

### Landing Page
Beautiful hero section with information about common crop diseases and prevention tips.

### Disease Detection Interface
1. Upload or drag-and-drop crop image
2. Optionally specify crop type and additional context
3. Click "Analyse Crop" for instant AI diagnosis
4. View results with typing animation effect
5. Download PDF report or submit feedback

### Admin Dashboard
- Total registered farmers
- Total predictions made
- Feedback statistics
- User management tools

## 🛠 Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **Vanilla JavaScript** - No framework dependencies
- **FileReader API** - Image processing
- **LocalStorage** - Client-side data persistence

### Backend
- **Node.js** - JavaScript runtime environment
- **Vercel Serverless Functions** - API hosting
- **jsonwebtoken (v9.0.3)** - JWT authentication
- **pg (v8.20.0)** - PostgreSQL client with connection pooling
- **dotenv (v17.4.2)** - Environment variable management

### Database
- **PostgreSQL** - Relational database with SSL support

### AI/ML
- **Azure OpenAI Service** - GPT-4 Vision (gpt-5.4-nano)
- **Model Configuration**:
  - Temperature: 0.2 (deterministic responses)
  - Max Tokens: 1000
  - Detail Level: High

### Deployment
- **Vercel** - Frontend and serverless API hosting
- **PostgreSQL** - Managed database service

## 🏗 System Architecture

```
┌─────────────┐
│   Browser   │ ──HTTPS──▶ ┌─────────────────┐
│  (Frontend) │            │  Vercel CDN     │
└─────────────┘            │  Static Assets  │
                           └────────┬────────┘
                                    │
                           ┌────────▼────────┐
                           │  Serverless API │
                           │  /api/*         │
                           └────┬───────┬────┘
                                │       │
                      ┌─────────┘       └─────────┐
                      │                       │
              ┌───────▼────────┐    ┌───▼──────────┐
              │  PostgreSQL    │    │ Azure OpenAI │
              │  Database      │    │  GPT-4 Vision│
              └────────────────┘    └──────────────┘
```

For detailed architecture diagrams, see [ARCHITECTURE_DOCUMENTATION.md](./ARCHITECTURE_DOCUMENTATION.md).

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **PostgreSQL** (v13 or higher) - [Download](https://www.postgresql.org/download/)
- **Azure OpenAI API Key** - [Get Access](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
- **Git** - Version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CropDisease_AI-Driven.git
cd CropDisease_AI-Driven
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

Create a PostgreSQL database and run the following schema:

```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  farm_location VARCHAR(255),
  primary_crops TEXT,
  role VARCHAR(20) DEFAULT 'farmer',
  registered_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Create predictions table
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  crop_type VARCHAR(100),
  disease_name VARCHAR(255),
  disease_type VARCHAR(100),
  causes TEXT,
  prevention TEXT,
  future TEXT,
  recommendations TEXT,
  image_data TEXT,
  feedback VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DB_HOST=your-postgres-host.com
DB_NAME=cropguard_db
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Azure OpenAI Configuration (Move to backend for production)
AZURE_API_KEY=your_azure_openai_api_key
AZURE_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_DEPLOYMENT=gpt-5.4-nano
AZURE_API_VERSION=2024-12-01-preview
```


⚠️ **Security Note**: The Azure OpenAI API key is currently hardcoded in `app.js` for development. For production, move these calls to a backend proxy endpoint.

### 5. Create First Admin User

Navigate to `http://localhost:3000/setup-admin.html` or use the API:

```bash
curl -X POST http://localhost:3000/api/setup-admin \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Admin User",
    "email": "admin@cropguard.com",
    "password": "securepassword123"
  }'
```

## ⚙️ Configuration

### Azure OpenAI Setup

1. Create an Azure account and activate OpenAI service
2. Deploy a GPT-4 Vision model
3. Copy your API key and endpoint
4. Update `app.js` or move to backend environment variables

### Database Connection

The application uses connection pooling for efficient database access. Configure in `api/_lib/db.js`:

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: { rejectUnauthorized: false }
});
```

### JWT Configuration

Default JWT expiry is 7 days. Modify in `api/_lib/auth.js`:

```javascript
const token = jwt.sign(
  { id: user.id, role: user.role }, 
  JWT_SECRET, 
  { expiresIn: '7d' }
);
```

## 📖 Usage

### For Farmers

#### 1. Register an Account

Navigate to `/register.html` and fill in:
- Full name
- Email or phone number
- Password (minimum 6 characters)
- Farm location (optional)
- Primary crops (optional)

#### 2. Login
Go to `/login.html` and enter your credentials.

#### 3. Detect Crop Disease
- Navigate to `/detection.html`
- Upload or drag-and-drop a crop image (max 10MB)
- Optionally specify crop type
- Add any additional context
- Click "Analyse Crop"
- Wait 4-8 seconds for AI analysis
- View comprehensive results

#### 4. View History
Scroll down to see all your previous analyses with:
- Disease name and type
- Crop type
- Recommendations
- Download PDF or delete options

#### 5. Download Reports
Click "Download PDF Report" to generate a professional report including:
- Crop image
- Disease diagnosis
- Causes
- Prevention measures
- Future avoidance tips
- Expert recommendations

### For Administrators

#### 1. Access Admin Dashboard
Navigate to `/admin.html` (requires admin role)

#### 2. View Statistics
- Total registered farmers
- Total predictions
- Feedback count

#### 3. Manage Users
- View all registered users
- Promote users to admin role
- Monitor system usage

#### 4. View All Predictions
Access comprehensive prediction data across all users.

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepass123",
  "farm_location": "Iowa",
  "primary_crops": "Corn, Wheat"
}

Response: 201 Created
{
  "message": "Account created.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

Response: 200 OK
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "user": { ... }
}
```

### Prediction Endpoints

#### Get User Predictions
```http
GET /api/predictions
Authorization: Bearer <token>

Response: 200 OK
{
  "predictions": [ ... ]
}
```

#### Create Prediction
```http
POST /api/predictions
Authorization: Bearer <token>
Content-Type: application/json

{
  "crop_type": "Tomato",
  "disease_name": "Late Blight",
  "disease_type": "Fungal",
  "causes": ["High humidity", "Cool temperatures"],
  "prevention": ["Use resistant varieties", "Apply fungicides"],
  "future": ["Crop rotation", "Proper spacing"],
  "recommendations": "Apply copper-based fungicides immediately...",
  "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}

Response: 201 Created
{
  "message": "Saved."
}
```

#### Delete Prediction
```http
DELETE /api/predictions/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Deleted."
}
```

#### Submit Feedback
```http
POST /api/predictions/:id/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "feedback": "helpful"
}

Response: 200 OK
{
  "message": "Feedback saved."
}
```

### Admin Endpoints

#### Get System Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "total_farmers": 150,
  "total_predictions": 1250,
  "total_feedback": 980
}
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "users": [ ... ]
}
```

#### Promote User to Admin
```http
POST /api/admin/promote/:userId
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "message": "User promoted to admin."
}
```

## 🗄 Database Schema

### Users Table
```sql
Column          | Type         | Constraints
----------------|--------------|---------------------------
id              | SERIAL       | PRIMARY KEY
full_name       | VARCHAR(255) | NOT NULL
email           | VARCHAR(255) | UNIQUE
phone           | VARCHAR(20)  | UNIQUE
password        | VARCHAR(255) | NOT NULL
farm_location   | VARCHAR(255) | 
primary_crops   | TEXT         | 
role            | VARCHAR(20)  | DEFAULT 'farmer'
registered_at   | TIMESTAMP    | DEFAULT NOW()
```

### Predictions Table
```sql
Column          | Type         | Constraints
----------------|--------------|---------------------------
id              | SERIAL       | PRIMARY KEY
user_id         | INTEGER      | FOREIGN KEY → users(id)
crop_type       | VARCHAR(100) | 
disease_name    | VARCHAR(255) | 
disease_type    | VARCHAR(100) | 
causes          | TEXT         | JSON array string
prevention      | TEXT         | JSON array string
future          | TEXT         | JSON array string
recommendations | TEXT         | 
image_data      | TEXT         | Base64 encoded
feedback        | VARCHAR(20)  | 'helpful' or 'not_helpful'
created_at      | TIMESTAMP    | DEFAULT NOW()
```

## 🌐 Deployment

### Deploy to Vercel

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Configure Project
The `vercel.json` file is already configured:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

#### 4. Set Environment Variables
```bash
vercel env add DB_HOST
vercel env add DB_NAME
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add JWT_SECRET
```

#### 5. Deploy
```bash
vercel --prod
```

### Deploy Database

Use a managed PostgreSQL service:
- **Vercel Postgres**
- **Supabase**
- **AWS RDS**
- **Azure Database for PostgreSQL**
- **Heroku Postgres**

## 🔒 Security Considerations

### Current Security Measures
✅ JWT-based authentication with 7-day expiration  
✅ CORS headers configured on all endpoints  
✅ SSL/TLS for database connections  
✅ Token-based authorization on protected routes  
✅ Role-based access control (farmer/admin)  
✅ File upload validation (type and size)  

### Security Improvements Needed
⚠️ **Password Hashing**: Implement bcrypt/argon2 for password storage  
⚠️ **Azure API Key**: Move from frontend to backend proxy  
⚠️ **Rate Limiting**: Add request throttling to prevent abuse  
⚠️ **Input Sanitization**: Enhanced SQL injection protection  
⚠️ **HTTPS Enforcement**: Force HTTPS in production  
⚠️ **Content Security Policy**: Add CSP headers  
⚠️ **CSRF Protection**: Implement for state-changing operations  

### Recommended Actions

1. **Hash Passwords**
```bash
npm install bcrypt
```

```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, user.password);
```

2. **Add Rate Limiting**
```bash
npm install express-rate-limit
```

3. **Move Azure API to Backend**
Create `/api/analyze-crop.js` to proxy Azure OpenAI requests.

4. **Environment Variables**
Never commit `.env` files. Use Vercel's environment variable management.

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with email
- [ ] User registration with phone
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Upload image and get disease detection
- [ ] View prediction history
- [ ] Download PDF report
- [ ] Submit feedback
- [ ] Delete prediction
- [ ] Admin access to dashboard
- [ ] Admin view statistics
- [ ] Admin promote user

### Test Credentials

After running setup, you can use:
- **Admin**: admin@cropguard.com / (your password)
- **Farmer**: Create via registration page

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use ESLint for code linting
- Follow JavaScript Standard Style
- Write meaningful commit messages
- Document all functions and APIs
- Add comments for complex logic

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Project Maintainer**: Your Name  
**Email**: your.email@example.com  
**Project Link**: [https://github.com/yourusername/CropDisease_AI-Driven](https://github.com/yourusername/CropDisease_AI-Driven)

## 🙏 Acknowledgments

- **Azure OpenAI** for providing powerful AI capabilities
- **PostgreSQL** for reliable database management
- **Vercel** for seamless deployment experience
- **Open source community** for invaluable tools and libraries

## 📚 Additional Documentation

- [Architecture Documentation](./ARCHITECTURE_DOCUMENTATION.md) - Detailed system architecture, diagrams, and technical specifications
- [API Reference](./ARCHITECTURE_DOCUMENTATION.md#api-endpoints-reference) - Complete API endpoint documentation
- [Database Schema](./ARCHITECTURE_DOCUMENTATION.md#database-schema--entity-relationships) - ERD and table structures

## 🗺 Roadmap

### Version 2.0 (Planned)
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] Real-time disease outbreak notifications
- [ ] Weather integration for predictive analysis
- [ ] Community forum for farmers
- [ ] Treatment effectiveness tracking

### Version 2.1 (Future)
- [ ] Machine learning model training from feedback
- [ ] Geographic disease mapping
- [ ] Seasonal pattern analysis
- [ ] Integration with IoT sensors
- [ ] Blockchain for data integrity

---

<div align="center">
  <p>Made with ❤️ for farmers worldwide</p>
  <p>🌾 Help us protect crops and improve food security 🌾</p>
</div>
