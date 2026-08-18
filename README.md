# MERN Demo Project

This project is a simple full-stack demo built with MongoDB, Express.js, React.js, and Node.js.

## Folder structure

- `/backend` — Express API with MongoDB connection and REST routes
- `/frontend` — React app with login, product CRUD, and transaction pages

## Admin login

- Username: `admin`
- Password: `password1`

The login attempt is stored in the MongoDB `logins` collection.

## Local setup

1. Install MongoDB locally if you want data to persist between backend restarts. If MongoDB is unavailable, the backend automatically uses an in-memory MongoDB instance for the current run.
2. In the backend folder, install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. In the frontend folder, install dependencies:
   ```bash
   cd frontend
   npm install
   ```
4. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```
5. Start the frontend in another terminal:
   ```bash
   cd frontend
   npm start
   ```
6. Open http://localhost:3000 in the browser.

## Backend URL

- API base URL: http://localhost:5000/api

## API routes

- POST /api/login
- GET /api/products
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id
- POST /api/transactions

## Testing the app

- Login with `admin` / `password1`
- Create a product from the Add Product page
- View all products from the Products page
- Edit or delete products
- Use the Transactions page to simulate a purchase by choosing a product and quantity

## Notes

- The frontend stores the session token in `localStorage`.
- If not authenticated, routes redirect back to the login page.
- MongoDB connection is configured in `/backend/.env` for `mongodb://127.0.0.1:27017/mern_demo`.

## Run the Project Locally

Follow these steps to run the complete application on a local machine.

### 1. Install the prerequisites

Install the following software:

- Node.js and npm: https://nodejs.org/
- MongoDB Community Edition (optional): https://www.mongodb.com/try/download/community
- Git, if you are cloning the project from a repository: https://git-scm.com/downloads

After installation, confirm that Node.js and npm are available:

```bash
node --version
npm --version
```

### 2. Open the project folder

Open a terminal and move to the project root, the folder that contains `backend` and `frontend`:

```bash
cd "path/to/MERN"
```

If you cloned the project, use the actual folder created by Git instead.

### 3. Start MongoDB (optional)

MongoDB is optional for this demo. If it is not running, the backend automatically starts an in-memory MongoDB instance. Use a local MongoDB service when you want products and login records to persist after restarting the backend.

The connection string below is configuration only; do not enter it directly as a terminal command.

```text
mongodb://127.0.0.1:27017/mern_demo
```

If you installed MongoDB, start its local service. The exact command depends on your operating system.

On Windows, start MongoDB from the Services application, or run:

```powershell
net start MongoDB
```

On macOS or Linux with the MongoDB service installed, run:

```bash
sudo systemctl start mongod
```

If MongoDB is running, the backend connects to `mongodb://127.0.0.1:27017/mern_demo`. Otherwise, it logs that it is using in-memory MongoDB and continues starting.

### 4. Install backend dependencies

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

### 5. Install frontend dependencies

Open a second terminal, return to the project root, and run:

```bash
cd frontend
npm install
```

### 6. Start the backend server

In the first terminal, from the `backend` folder, run:

```bash
npm run dev
```

The API starts at:

```text
http://localhost:5000
```

You can check that it is running by opening this URL in a browser:

```text
http://localhost:5000/api/health
```

The first backend startup creates the default admin login and sample products in MongoDB when they do not already exist.

### 7. Start the frontend application

In the second terminal, from the `frontend` folder, run:

```bash
npm start
```

The React application opens at:

```text
http://localhost:3000
```

If it does not open automatically, visit that URL manually.

### 8. Use the application

1. Open `http://localhost:3000`.
2. Log in with username `admin` and password `password1`.
3. Add a product from the Add Product page.
4. View, edit, or delete products from the Products page.
5. Use the Transactions page to select a product and quantity.

### 9. Stop the project

Press `Ctrl+C` in the backend and frontend terminals to stop the development servers. Stop the MongoDB service separately if you started it manually.

### Troubleshooting

- If the backend cannot connect to MongoDB, confirm that MongoDB is running and that port `27017` is available.
- If port `5000` or `3000` is already in use, stop the other application using it and start this project again.
- If dependencies are missing, run `npm install` again inside both the `backend` and `frontend` folders.
- If the frontend redirects to the login page, log in again. The authentication token is stored in the browser's `localStorage`.
