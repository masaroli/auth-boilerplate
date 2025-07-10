# auth-boilerplate

This repository provides a modular starter template built with Express.js and NextJS

## **Technologies Used**

Backend: ExpressJS, TypeScript, JSON Web Token, JOI validations, MongoDB, Mongoose.
**(WIP)** Frontend: NextJS, TypeScript

## **Project Structure**

```
/
├── backend/
├── frontend/
```

## **Getting Started**

Follow these steps to get the project up and running on your local machine.

### **Installation**

1. **Clone the repository:**

   `git clone https://github.com/masaroli/auth-boilerplate.git`

2. **Install backend dependencies**

   `cd backend && npm install`

3. **Create `.env` file for Backend:**

   Create a `.env` **inside the `backend/` folder** (i.e., `backend/.env`).
   You can use the .env.example as guidance

4. **Install frontend dependencies**

   `cd ../frontend && npm install`

5. **Create `.env.local` file for Frontend:**

   Create a file named `.env.local` **inside the `frontend/` folder** (i.e., `frontend/.env.local`).to your Next.js frontend.

   Add the following variable:

   ```dotenv
   NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api" # Adjust if your backend API base path changes
   ```

   **Note:** Next.js automatically loads `.env.local` and variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Ensure `frontend/.gitignore` also includes `.env.local`.

### **Running the Project**

1. **Start the Backend Server:**
   Navigate to the `backend/` directory and run:
   `npm start`
   The server will typically run on `http://localhost:3001`.

2. **Start the Frontend Development Server:**
   Navigate to the `frontend/` directory and run:
   `npm run dev`
   The frontend will typically run on `http://localhost:3000`.

Your application should now be accessible in your browser at `http://localhost:3000`.

### **API Endpoints (Backend)**

The backend API endpoints are mounted under `/api`.

**Authentication Routes (`/api/auth`):**

- `POST /api/auth/register` - Register a new user (requires admin token after initial setup).
- `POST /api/auth/login` - Log in a user and receive a JWT.
- `POST /api/auth/logout` - Log out a user by clearing the authentication cookie.

**User Management Routes (`/api`):**

- `GET /api/profile` - Get the profile of the authenticated user.
- `GET /api/admin/data` - Get sensitive admin data (requires admin role).
- `GET /api/user/:id` - Get a specific user's data by ID (requires admin role or self-access).
- `GET /api/users` - Get a list of all users (requires admin role).
- `PUT /api/user/reset-password/:id` - Reset a user's password (requires admin role).
- `DELETE /api/user/delete/:id` - Delete a user (requires admin role).

---
