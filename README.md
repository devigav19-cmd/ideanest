# IdeaNest – Collaborative Idea Management & Validation Platform

A full-stack MERN academic project where users submit ideas, receive community feedback, find collaborators, and connect with investors.

## Features

- **4 User Roles** – Creator, Collaborator, Investor, Admin
- **Idea Submission** – Title, description, category, tags, stage
- **Upvote / Downvote / Rating** – Community validation system
- **Feedback & Discussion** – Tabbed comment system (feedback vs discussion)
- **Collaboration Requests** – Collaborators can request to join ideas
- **Investor Discovery** – Search, filter, and express investment interest
- **Bookmarks** – Save ideas for later
- **Admin Panel** – User & idea management, platform statistics
- **Notifications** – In-app notifications for key actions
- **Role-Based Dashboards** – Tailored views per user role

## Tech Stack

| Layer     | Technology                      |
|-----------|---------------------------------|
| Frontend  | React 18, React Router v6, Axios |
| Backend   | Node.js, Express.js             |
| Database  | MongoDB, Mongoose               |
| Auth      | JWT (jsonwebtoken, bcryptjs)    |
| Styling   | Plain CSS                       |

## Project Structure

```
IdeaNest/
├── server/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth & role middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth context provider
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service modules
│   │   ├── App.js       # Routes & layout
│   │   ├── App.css      # Global styles
│   │   └── index.js     # React entry point
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js** v16 or higher
- **MongoDB** running locally on `mongodb://localhost:27017`

## Setup Instructions

### 1. Clone / Download the project

```bash
cd IdeaNest
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Install client dependencies

```bash
cd ../client
npm install
```

### 4. Configure environment

The `server/.env` file is already set up with defaults:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ideanest
JWT_SECRET=ideanest_jwt_secret_key_2024
JWT_EXPIRE=7d
```

Update `MONGO_URI` if your MongoDB is running elsewhere.

### 5. Start the application

**Terminal 1 – Start the server:**
```bash
cd server
npm run dev
```

**Terminal 2 – Start the client:**
```bash
cd client
npm start
```

The app will open at **http://localhost:3000** and the API runs on **http://localhost:5000**.

## API Endpoints

### Auth
- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Login and get JWT
- `GET /api/auth/me` – Get current user

### Ideas
- `GET /api/ideas` – List ideas (search, filter, paginate)
- `GET /api/ideas/trending` – Trending ideas by views
- `GET /api/ideas/my` – Current user's ideas
- `GET /api/ideas/:id` – Get idea details
- `POST /api/ideas` – Create idea
- `PUT /api/ideas/:id` – Update idea
- `DELETE /api/ideas/:id` – Delete idea
- `PUT /api/ideas/:id/upvote` – Toggle upvote
- `PUT /api/ideas/:id/downvote` – Toggle downvote
- `POST /api/ideas/:id/rate` – Rate idea (1–5)

### Comments
- `GET /api/comments/idea/:ideaId` – Get comments for an idea
- `POST /api/comments/idea/:ideaId` – Add a comment
- `DELETE /api/comments/:id` – Delete a comment

### Collaborations
- `POST /api/collaborations` – Send collaboration request
- `GET /api/collaborations/my` – My requests
- `PUT /api/collaborations/:id` – Accept / reject

### Investments
- `POST /api/investments` – Send investment interest
- `GET /api/investments/my` – My sent interests
- `GET /api/investments/received` – Interests received on my ideas
- `PUT /api/investments/:id` – Accept / reject

### Users
- `GET /api/users/:id` – Get user by ID
- `PUT /api/users/profile` – Update profile
- `PUT /api/users/bookmark/:ideaId` – Toggle bookmark
- `GET /api/users/bookmarks/me` – Get my bookmarks

### Notifications
- `GET /api/notifications` – My notifications
- `PUT /api/notifications/read` – Mark all as read

### Admin (admin role only)
- `GET /api/admin/users` – All users
- `DELETE /api/admin/users/:id` – Delete user
- `GET /api/admin/ideas` – All ideas
- `DELETE /api/admin/ideas/:id` – Delete idea
- `GET /api/admin/stats` – Platform statistics

## Default Roles

| Role         | Capabilities                                         |
|--------------|------------------------------------------------------|
| Creator      | Submit ideas, manage own ideas, accept collaborations |
| Collaborator | Browse ideas, request to collaborate                  |
| Investor     | Discover ideas, express investment interest, bookmark |
| Admin        | Manage all users & ideas, view platform stats         |

## License

This project is for academic / educational use.
