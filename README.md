🎬 Movie booking application - Backend  

Project Description
The Movie Booking Application (Backend) is a secure Node.js + Express server that powers the frontend with REST APIs and WebSocket communication. It handles user authentication, movie data, seat reservations, and real-time updates.

---

Features
- Movie Management: Fetch and serve movie details & posters.
- Authentication: JWT-based auth + Google OAuth integration.
- Seat Booking: API for reserving and booking seats.
- Real-Time Updates: Socket.IO for live seat availability.
- Database Integration: Relational schema for movies, users, and bookings.
- API-first Design: Designed for scalability & clean integration with frontend.

---

Tech Stack
- Node.js + Express
- PostgreSQL + Prisma ORM
- Socket.IO
- JWT & Google OAuth
- bcrypt for password security
- Docker (optional, for deployment)

---

 Getting Started
1. Clone the repository
git clone 
cd movie-booking-app/backend

3. Install dependencies
Copy code
npm install

3. Setup environment variables
Create a .env file in the backend folder:

env
Copy code
PORT=4000
DATABASE_URL=your_postgres_connection_url
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

4. Run migrations
bash
Copy code
npx prisma migrate dev

6. Start the server
bash
Copy code
npm run dev

Project Links

Frontend Repo: https://github.com/nviji94/Movie-booking-frontend
Live repo: https://movie-booking-frontend-t58f.onrender.com/

