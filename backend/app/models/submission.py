# submission model will be implemented in the database-model step.
from app.extensions import db


class Submission(db.Model):
    __tablename__ = "submissions"

    id = db.Column(db.Integer, primary_key=True)

    code = db.Column(db.Text, nullable=False)

    language = db.Column(
        db.String(30),
        nullable=False,
        default="python"
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="pending"
    )

    score = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    execution_time = db.Column(
        db.Float,
        nullable=True
    )

    error_message = db.Column(
        db.Text,
        nullable=True
    )

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    problem_id = db.Column(
        db.Integer,
        db.ForeignKey("problems.id"),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )

    student = db.relationship(
        "User",
        back_populates="submissions"
    )

    problem = db.relationship(
        "Problem",
        back_populates="submissions"
    )

    def __repr__(self):
        return f"<Submission {self.id}>"