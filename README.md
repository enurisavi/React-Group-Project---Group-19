# SyncBoard (CollabBoard) – Task Management Application

SyncBoard is a collaborative Kanban-style task management application built with a React frontend and an Express/Node.js REST API backend.

## Technical Stack
* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB via Mongoose ODM
* **Testing:** Jest & Supertest

## How to Run the Application

### Prerequisites
* Node.js (v18 or higher)
* npm

### Running the Project

```bash
# 1. Setup & Run Backend (Terminal 1)
cd backend
npm install
npm run dev

# 2. Setup & Run Frontend (Terminal 2)
cd frontend
npm install
npm start

# 3. Run Automated Backend Tests
cd backend
npm test