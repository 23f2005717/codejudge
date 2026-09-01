# auth routes will be implemented in the documented API step.
from flask import Flask, jsonify, request
from flask_jwt_extended import create_access_token

from .config import Config
from .extensions import cors, db, jwt
from .models.user import User
from .models.problem import Problem
from .models.testcase import TestCase
from .models.submission import Submission
from .utils.auth import hash_password, check_password


def create_app(config_class=Config):
    app = Flask(__name__)

    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}}
    )

    # Create database tables automatically.
    with app.app_context():
        db.create_all()

    @app.get("/api/health")
    def health():
        return jsonify({
            "status": "ok",
            "service": "codejudge-backend"
        })

    @app.post("/api/auth/register")
    def register():
        data = request.get_json() or {}

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "student")

        if not name or not email or not password:
            return jsonify({
                "message": "Name, email and password are required."
            }), 400

        if role not in ["student", "instructor"]:
            return jsonify({
                "message": "Role must be student or instructor."
            }), 400

        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            return jsonify({
                "message": "Email is already registered."
            }), 409

        user = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role=role
        )

        db.session.add(user)
        db.session.commit()

        return jsonify({
            "message": "Registration successful.",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }), 201

    @app.post("/api/auth/login")
    def login():
        data = request.get_json() or {}

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({
                "message": "Email and password are required."
            }), 400

        user = User.query.filter_by(email=email).first()

        if not user or not check_password(
            password,
            user.password_hash
        ):
            return jsonify({
                "message": "Invalid email or password."
            }), 401

        token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "role": user.role,
                "email": user.email
            }
        )

        return jsonify({
            "message": "Login successful.",
            "access_token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        })

    return app