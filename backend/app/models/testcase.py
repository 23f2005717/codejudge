# testcase model will be implemented in the database-model step.
from app.extensions import db


class TestCase(db.Model):
    __tablename__ = "test_cases"

    id = db.Column(db.Integer, primary_key=True)

    input_data = db.Column(db.Text, nullable=False)
    expected_output = db.Column(db.Text, nullable=False)

    is_sample = db.Column(
        db.Boolean,
        nullable=False,
        default=False
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

    problem = db.relationship(
        "Problem",
        back_populates="test_cases"
    )

    def __repr__(self):
        return f"<TestCase {self.id}>"