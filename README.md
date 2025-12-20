# NGO Volunteer Coordination Portal

A full-stack MERN application for NGOs to coordinate volunteer activities, manage events, and assign tasks.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally on port 27017)

## Getting Started

### 1. Start MongoDB

Make sure MongoDB is running locally:

```bash
mongod
```

Or use MongoDB Compass to connect to `mongodb://localhost:27017`

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:5173

## User Roles

### Admin (NGO Coordinator)
- Create events
- View volunteers per event
- Create tasks
- Assign tasks to volunteers

### Volunteer
- View all events
- Join events
- View assigned tasks
- Update task status (pending → in-progress → completed)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Events
- `POST /api/events` - Create event (admin)
- `GET /api/events` - Get all events
- `GET /api/events/my-events` - Get admin's events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events/:id/join` - Join event (volunteer)

### Tasks
- `POST /api/tasks` - Create task (admin)
- `PUT /api/tasks/:id/assign` - Assign task (admin)
- `GET /api/tasks/my-tasks` - Get my tasks (volunteer)
- `PUT /api/tasks/:id/status` - Update task status (volunteer)
- `GET /api/tasks/event/:eventId` - Get tasks by event

## Project Structure

```
ngo-mern/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── role.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   └── taskRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── CreateEvent.jsx
│   │   │   │   └── EventDetails.jsx
│   │   │   ├── volunteer/
│   │   │   │   ├── EventList.jsx
│   │   │   │   ├── EventDetails.jsx
│   │   │   │   └── MyTasks.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Environment Variables

Backend `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ngo-volunteer
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Success Criteria (Increment 1)

- [x] Admin can create an event
- [x] Volunteer can join an event
- [x] Admin can assign a task
- [x] Volunteer can update task status
- [x] All data persists after refresh
