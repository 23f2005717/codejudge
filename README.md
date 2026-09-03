# CodeJudge

CodeJudge is a Python coding-judge platform with separate Student and Instructor flows.

## Project rule
The implementation follows the supplied Final Build Document and wireframe strictly. Do not add screens, roles, or flows outside the documented scope without an explicit requirement.

## Stack
- Frontend: Angular, TypeScript, Angular Material, Monaco Editor
- Backend: Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS
- Database: PostgreSQL
- Code execution: Docker + Python
- Testing: Pytest

## Current setup
The repository scaffold is created. Backend and frontend feature implementation will follow the documented implementation order.



# Local Setup Guide

## Requirements

Install the following before running the project:

- Python 3.10+
- Node.js + npm
- PostgreSQL

## 1. Clone or Download the Project

Clone the repository:

    git clone https://github.com/23f2005717/codejudge.git
    cd codejudge

Or download the ZIP file and extract it.

## 2. Setup PostgreSQL

Make sure PostgreSQL is installed and running.

Create a database named:

    codejudge

## 3. Setup Backend

Open a terminal in the project root and run:

    cd backend
    python -m venv venv

Activate the virtual environment.

Windows:

    .\venv\Scripts\Activate.ps1

Linux/macOS:

    source venv/bin/activate

Install the required Python packages:

    pip install -r requirements.txt

Create the following file:

    backend/.env

Add:

    FLASK_ENV=development
    SECRET_KEY=change-me
    JWT_SECRET_KEY=change-me
    DATABASE_URL=postgresql+psycopg2://postgres:<YOUR_PASSWORD>@localhost:5432/codejudge

Replace <YOUR_PASSWORD> with your PostgreSQL password.

Start the backend:

    python run.py

The backend will run at:

    http://127.0.0.1:5000

## 4. Setup Frontend

Open a new terminal and go to the frontend directory:

    cd frontend

Install the frontend dependencies:

    npm install

Start the Angular application:

    npm start

The frontend will run at:

    http://localhost:4200

## 5. Run the Application

Keep PostgreSQL running.

Keep the backend running in one terminal:

    cd backend
    .\venv\Scripts\Activate.ps1
    python run.py

Keep the frontend running in another terminal:

    cd frontend
    npm start

Open the application in your browser:

    http://localhost:4200

## 6. Important Notes

- PostgreSQL must be running before starting the backend.
- The database name must be `codejudge`.
- Create `backend/.env` using your local PostgreSQL password.
- Do not commit `backend/.env` to GitHub.
- `backend/.env.example` can be used as a reference.
- The backend automatically creates the required database tables when it starts.
  


