from flask import jsonify
from flask_jwt_extended import (
    get_jwt,
    get_jwt_identity,
    jwt_required
)

from ..models.problem import Problem
from ..models.submission import Submission


def register_analytics_routes(app):

    @app.get("/api/instructor/analytics")
    @jwt_required()
    def get_instructor_analytics():

        claims = get_jwt()

        if claims.get("role") != "instructor":
            return jsonify({
                "message": "Only instructors can view analytics."
            }), 403

        instructor_id = int(get_jwt_identity())

        problems = (
            Problem.query
            .filter(
                Problem.instructor_id == instructor_id
            )
            .order_by(
                Problem.created_at.desc()
            )
            .all()
        )

        problem_ids = {
            problem.id
            for problem in problems
        }

        if problem_ids:
            submissions = (
                Submission.query
                .filter(
                    Submission.problem_id.in_(
                        problem_ids
                    )
                )
                .order_by(
                    Submission.created_at.desc()
                )
                .all()
            )
        else:
            submissions = []

        total_submissions = len(submissions)

        student_ids = {
            submission.student_id
            for submission in submissions
        }

        published_problems = [
            problem
            for problem in problems
            if problem.is_published
        ]

        difficulty_counts = {
            "easy": 0,
            "medium": 0,
            "hard": 0
        }

        for problem in published_problems:

            difficulty = problem.difficulty.lower()

            if difficulty in difficulty_counts:
                difficulty_counts[difficulty] += 1

        status_counts = {
            "Accepted": 0,
            "Wrong Answer": 0,
            "Runtime Error": 0,
            "Time Limit": 0
        }

        for submission in submissions:

            status = submission.status

            if status == "Time Limit Exceeded":
                status = "Time Limit"

            if status in status_counts:
                status_counts[status] += 1

        submission_statuses = []

        for label, count in status_counts.items():

            if total_submissions:
                percentage = round(
                    (count / total_submissions) * 100
                )
            else:
                percentage = 0

            submission_statuses.append({
                "label": label,
                "count": count,
                "percentage": percentage
            })

        problem_performance = []

        for problem in problems:

            problem_submissions = [
                submission
                for submission in submissions
                if submission.problem_id == problem.id
            ]

            submission_count = len(
                problem_submissions
            )

            accepted_count = sum(
                1
                for submission in problem_submissions
                if submission.status == "Accepted"
            )

            if submission_count:
                acceptance_rate = round(
                    (
                        accepted_count
                        / submission_count
                    ) * 100
                )
            else:
                acceptance_rate = 0

            problem_performance.append({
                "id": problem.id,
                "title": problem.title,
                "difficulty": (
                    problem.difficulty.capitalize()
                ),
                "submissions": submission_count,
                "accepted": accepted_count,
                "acceptanceRate": acceptance_rate
            })

        return jsonify({
            "totalSubmissions": total_submissions,
            "totalProblems": len(problems),
            "publishedProblems": len(
                published_problems
            ),
            "activeStudents": len(student_ids),
            "submissionStatuses": submission_statuses,
            "difficultyCounts": difficulty_counts,
            "problemPerformance": problem_performance
        }), 200