# CodeJudge

CodeJudge is a Python coding-judge platform with separate Student and Instructor flows.

## Project Rule

The implementation follows the supplied Final Build Document and wireframe strictly. Do not add screens, roles, or flows outside the documented scope without an explicit requirement.

## Stack

- Frontend: Angular, TypeScript, Angular Material, Monaco Editor
- Backend: Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS
- Database: PostgreSQL
- Code Execution: Docker + Python
- Testing: Pytest

## Local Setup Guide

### Requirements

Install the following before running the project:

- Python 3.10+
- Node.js + npm
- PostgreSQL

### 1. Clone or Download the Project

Clone the repository:

    git clone https://github.com/23f2005717/codejudge.git
    cd codejudge

Or download the ZIP file and extract it.

### 2. Setup PostgreSQL

Make sure PostgreSQL is installed and running.

Create a database named:

    codejudge

### 3. Setup Backend

Open a terminal in the project root:

    cd backend
    python -m venv venv

Activate the virtual environment.

Windows:

    .\venv\Scripts\Activate.ps1

Linux/macOS:

    source venv/bin/activate

Install the required packages:

    pip install -r requirements.txt

Create:

    backend/.env

Add:

    FLASK_ENV=development
    SECRET_KEY=change-me
    JWT_SECRET_KEY=change-me
    DATABASE_URL=postgresql+psycopg2://postgres:<YOUR_PASSWORD>@localhost:5432/codejudge

Replace <YOUR_PASSWORD> with your PostgreSQL password.

Start the backend:

    python run.py

Backend:

    http://127.0.0.1:5000

### 4. Setup Frontend

Open a new terminal:

    cd frontend
    npm install
    npm start

Frontend:

    http://localhost:4200

### 5. Run the Application

Make sure PostgreSQL is running.

Backend terminal:

    cd backend
    .\venv\Scripts\Activate.ps1
    python run.py

Frontend terminal:

    cd frontend
    npm start

Open the application:

    http://localhost:4200

### Important Notes

- PostgreSQL must be running before starting the backend.
- The database name must be `codejudge`.
- Create `backend/.env` using your local PostgreSQL password.
- Do not commit `backend/.env` to GitHub.
- Use `backend/.env.example` as a reference.
- The backend automatically creates the required database tables when it starts.
