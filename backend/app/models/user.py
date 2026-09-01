# user model will be implemented in the database-model step.
from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )

    problems = db.relationship(
        "Problem",
        back_populates="instructor",
        lazy=True
    )

    submissions = db.relationship(
        "Submission",
        back_populates="student",
        lazy=True
    )

    def __repr__(self):
        return f"<User {self.email}>"