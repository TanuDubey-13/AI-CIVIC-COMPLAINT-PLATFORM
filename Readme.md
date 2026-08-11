# 🚨 AI Civic Complaint Platform  
## Smart Public Infrastructure Monitoring & Complaint Management System

![AI Civic Complaint Platform](https://img.shields.io/badge/AI-Civic%20Platform-blue)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Python](https://img.shields.io/badge/AI-Service-Flask-yellow)


# 📌 Overview

The **AI Civic Complaint Platform** is an AI-powered smart complaint management system that connects citizens with government authorities to improve public infrastructure monitoring.

Citizens can report issues such as:

- 🛣️ Potholes and road damage
- 💡 Broken streetlights
- 🗑️ Garbage overflow
- 💧 Water leakage
- 🚧 Damaged public infrastructure

by uploading images, providing location details, and describing the problem.

The system uses Artificial Intelligence to automatically analyze complaints, classify issues, estimate severity, and assist authorities in faster resolution.


---

# 🎯 Problem Statement

Urban areas generate thousands of civic complaints every day, but existing systems face several problems:

- Manual complaint classification
- Incorrect complaint information
- Duplicate complaints
- Slow response time
- Lack of transparency
- Poor prioritization of critical issues
- No centralized analytics system

This results in delayed resolutions, inefficient resource usage, and reduced citizen trust.


---

# 💡 Proposed Solution

The AI Civic Complaint Platform provides a centralized intelligent platform where:

## Citizens can:

✅ Create an account  
✅ Submit civic complaints  
✅ Upload issue images  
✅ Select issue location  
✅ Track complaint progress  
✅ View complaint history  


## Government Officials can:

✅ View complaints dashboard  
✅ Filter complaints by category and severity  
✅ Assign complaints to departments  
✅ Update complaint status  
✅ Analyze civic problems using analytics  


---

# 🏗️ System Architecture


```
                    Citizen
                       |
                       |
              React Frontend
              (Vite + React)
                       |
                       |
                 REST APIs
                       |
                       |
          Node.js + Express Backend
                       |
        --------------------------------
        |                              |
     MongoDB                      AI Service
                                    |
                              Flask + ML Model
                                    |
                          Complaint Classification

```


---

# 🚀 Features


# 👤 Citizen Module


## Authentication

- User registration
- Login system
- JWT authentication
- Role-based access control


## Complaint Submission

Users can submit:

- Complaint title
- Description
- Image
- Location
- Latitude
- Longitude


## AI Complaint Analysis

AI analyzes complaints and predicts:

```
Category:
road_damage

Severity:
high

Confidence:
92%
```


## Complaint Tracking

Complaint lifecycle:

```
Pending
   |
In Progress
   |
Resolved
```


Users can monitor complaint progress in real time.


---

# 🏢 Admin / Officer Module


## Dashboard

Provides:

- Total complaints
- Pending complaints
- Resolved complaints
- Category statistics
- Severity analytics


## Complaint Management

Officials can:

- View complaints
- Filter complaints
- Update status
- Assign departments
- Monitor resolution progress


---

# 🛠️ Technology Stack


## Frontend

| Technology | Usage |
|---|---|
| React.js | User Interface |
| Vite | Build Tool |
| React Router | Navigation |
| Axios | API Requests |
| Tailwind CSS | Styling |
| Chart.js | Analytics |


---

## Backend

| Technology | Usage |
|---|---|
| Node.js | Runtime |
| Express.js | API Development |
| MongoDB | Database |
| Mongoose | Database Modeling |
| JWT | Authentication |
| Cloudinary | Image Storage |


---

## AI Service

| Technology | Usage |
|---|---|
| Python | AI Processing |
| Flask | AI API |
| Machine Learning Model | Classification |


---

# 📂 Project Structure


```
AI-CIVIC-COMPLAINT-PLATFORM

│
├── client
│   │
│   ├── public
│   │
│   └── src
│       │
│       ├── components
│       │   ├── Charts
│       │   ├── ComplaintCard
│       │   ├── ImageUploader
│       │   ├── MapPicker
│       │   ├── Navbar
│       │   ├── Notification
│       │   ├── StatusTimeline
│       │   └── Footer
│       │
│       ├── context
│       ├── hooks
│       ├── layouts
│       ├── pages
│       ├── routes
│       ├── services
│       └── utils
│
│
├── server
│   │
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── utils
│   ├── app.js
│   └── server.js
│
│
├── ai-service
│   │
│   ├── api
│   ├── dataset
│   ├── models
│   ├── training
│   ├── utils
│   └── requirements.txt
│
│
├── database
│
├── docker-compose.yml
│
└── README.md

```


---

# ⚙️ Installation & Setup


## 1. Clone Repository


```bash
git clone https://github.com/TanuDubey-13/AI-CIVIC-COMPLAINT-PLATFORM.git

cd AI-CIVIC-COMPLAINT-PLATFORM
```


---

# Frontend Setup


```bash
cd client

npm install

npm run dev
```


Frontend:

```
http://localhost:5173
```


---

# Backend Setup


```bash
cd server

npm install

npm run dev
```


Backend:

```
http://localhost:5000
```


---

# AI Service Setup


Go to AI service:


```bash
cd ai-service
```


Create virtual environment:


```bash
python -m venv venv
```


Activate environment:


Windows:

```bash
venv\Scripts\activate
```


Install dependencies:


```bash
pip install -r requirements.txt
```


Run AI service:


```bash
python api/app.py
```


AI Service:

```
http://localhost:8000
```


---

# 🔐 Environment Variables


## Server `.env`


```
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key


CLOUDINARY_NAME=your_cloudinary_name

CLOUDINARY_API_KEY=your_cloudinary_key

CLOUDINARY_API_SECRET=your_cloudinary_secret


AI_SERVICE_URL=http://localhost:8000
```


---

## Client `.env`


```
VITE_API_URL=http://localhost:5000/api
```


---

# 📡 API Endpoints


## Authentication


```
POST /api/auth/register

POST /api/auth/login
```


---

## Complaints


Create complaint:

```
POST /api/complaints
```


Get user complaints:

```
GET /api/complaints/my
```


Get all complaints:

```
GET /api/complaints
```


Get single complaint:

```
GET /api/complaints/:id
```


Update complaint status:

```
PATCH /api/complaints/:id/status
```


---

## AI Service


```
POST /api/ai/analyze
```


---

# 🔮 Future Enhancements


- Real-time notifications
- Duplicate complaint detection
- AI image classification
- Smart department allocation
- Heatmap visualization
- Mobile application
- Voice-based complaint registration
- Government system integration
- Advanced analytics dashboard


---

# 👩‍💻 Developer


## Tanu Dubey
## Vartika Misra

B.Tech Computer Science Engineering


---

# ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

---

# 📜 License

This project is developed for educational and innovation purposes.