# problem model will be implemented in the database-model step.
from app.extensions import db


class Problem(db.Model):
    __tablename__ = "problems"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)

    difficulty = db.Column(
        db.String(20),
        nullable=False,
        default="easy"
    )

    input_format = db.Column(db.Text, nullable=True)
    output_format = db.Column(db.Text, nullable=True)
    constraints = db.Column(db.Text, nullable=True)

    is_published = db.Column(
        db.Boolean,
        nullable=False,
        default=False
    )

    instructor_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        server_default=db.func.now()
    )

    instructor = db.relationship(
        "User",
        back_populates="problems"
    )

    test_cases = db.relationship(
        "TestCase",
        back_populates="problem",
        cascade="all, delete-orphan",
        lazy=True
    )

    submissions = db.relationship(
        "Submission",
        back_populates="problem",
        lazy=True
    )

    def __repr__(self):
        return f"<Problem {self.title}>"