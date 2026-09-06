

```markdown
# SyncBoard – Collaborative Task Management Application

SyncBoard is a full-stack, real-time collaborative Kanban-style task management system built on the MERN stack with Optimistic Concurrency Control (OCC) and offline resilience.

---

## Technical Stack

* **Frontend:** React.js, Axios, React Context API
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas via Mongoose ODM
* **Authentication:** JSON Web Tokens (JWT), bcryptjs
* **Testing:** Jest, Supertest

---

## Key Features

* **Kanban Workflow:** Drag/move tasks smoothly across `TODO`, `DOING`, and `DONE` states.
* **Optimistic Concurrency Control (OCC):** Leverages Mongoose `__v` document versioning to detect concurrent update conflicts and prevent data overwrites.
* **Conflict Resolution UI:** Automatic modal prompt (`ConflictModal`) triggered upon HTTP 409 status codes to resolve stale state.
* **Offline Resilience & Cross-Tab Sync:** Local storage fallback cache with custom window storage event synchronization across multiple active tabs.
* **Protected REST API:** Endpoints guarded by JWT bearer token middleware.

---

## How to Run the Application

### 1. Prerequisites

Ensure you have the following installed:
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Git**
* Active MongoDB Atlas cluster URI

---

### 2. Clone and Setup Environment

Clone the repository:

```bash
git clone https://github.com/enurisavi/React-Group-Project---Group-19.git
cd React-Group-Project---Group-19

```

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/syncboard?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key

```

---

### 3. Start the Backend Server (Terminal 1)

```bash
cd backend
npm install
npm run dev

```

---

### 4. Start the Frontend Client (Terminal 2)

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev

```



