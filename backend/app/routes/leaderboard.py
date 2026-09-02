from collections import defaultdict

from flask import jsonify
from flask_jwt_extended import jwt_required

from ..models.submission import Submission
from ..models.user import User


def register_leaderboard_routes(app):
    @app.get("/api/leaderboard")
    @jwt_required()
    def get_leaderboard():
        students = (
            User.query
            .filter_by(role="student")
            .order_by(User.name.asc())
            .all()
        )

        submissions = (
            Submission.query
            .join(User, Submission.student_id == User.id)
            .filter(User.role == "student")
            .all()
        )

        best_scores = defaultdict(dict)
        submission_counts = defaultdict(int)

        for submission in submissions:
            student_id = submission.student_id
            problem_id = submission.problem_id

            submission_counts[student_id] += 1

            current_best = best_scores[student_id].get(problem_id)

            if current_best is None or submission.score > current_best:
                best_scores[student_id][problem_id] = submission.score

        leaderboard = []

        for student in students:
            student_scores = best_scores.get(student.id, {})

            solved = sum(
                1
                for problem_id in student_scores
                if any(
                    submission.student_id == student.id
                    and submission.problem_id == problem_id
                    and submission.status == "Accepted"
                    for submission in submissions
                )
            )

            total_score = sum(student_scores.values())

            leaderboard.append({
                "student_id": student.id,
                "name": student.name,
                "solved": solved,
                "submissions": submission_counts.get(student.id, 0),
                "score": total_score
            })

        leaderboard.sort(
            key=lambda entry: (
                -entry["score"],
                -entry["solved"],
                entry["name"].lower()
            )
        )

        for index, entry in enumerate(leaderboard, start=1):
            entry["rank"] = index

        return jsonify({
            "count": len(leaderboard),
            "leaderboard": leaderboard
        }), 200