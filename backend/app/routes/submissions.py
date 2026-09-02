# submissions routes will be implemented in the documented API step.
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from .extensions import db
from .models.problem import Problem
from .models.submission import Submission
from .utils.code_executor import run_python_code


def register_submission_routes(app):

    @app.post("/api/problems/<int:problem_id>/run")
    @jwt_required()
    def run_code(problem_id):
        """Run Python code against public/sample test cases."""

        problem = db.session.get(Problem, problem_id)

        if problem is None:
            return jsonify({
                "message": "Problem not found."
            }), 404

        data = request.get_json() or {}

        code = data.get("code")
        language = data.get("language", "python")

        if not code:
            return jsonify({
                "message": "Code is required."
            }), 400

        if language.lower() != "python":
            return jsonify({
                "message": "Currently only Python execution is supported."
            }), 400

        sample_test_cases = [
            test_case
            for test_case in problem.test_cases
            if test_case.is_sample
        ]

        if not sample_test_cases:
            return jsonify({
                "message": "This problem has no public test cases.",
                "result": {
                    "status": "No Test Cases",
                    "passed_tests": 0,
                    "total_tests": 0,
                    "execution_time": 0,
                    "error_message": None
                }
            }), 200

        passed = 0
        total = len(sample_test_cases)
        total_execution_time = 0
        final_status = "Accepted"
        final_error = None

        for test_case in sample_test_cases:
            result = run_python_code(
                code,
                test_case.input_data
            )

            total_execution_time += result["execution_time"]

            if result["status"] == "Time Limit Exceeded":
                final_status = "Time Limit Exceeded"
                final_error = result["error_message"]
                break

            if result["status"] in [
                "Runtime Error",
                "Execution Error"
            ]:
                final_status = result["status"]
                final_error = result["error_message"]
                break

            actual_output = result["output"].strip()
            expected_output = test_case.expected_output.strip()

            if actual_output == expected_output:
                passed += 1
            else:
                final_status = "Wrong Answer"
                final_error = "Output does not match the expected result."
                break

        if final_status == "Accepted" and passed != total:
            final_status = "Wrong Answer"

        return jsonify({
            "message": "Code executed successfully.",
            "result": {
                "status": final_status,
                "passed_tests": passed,
                "total_tests": total,
                "execution_time": round(
                    total_execution_time,
                    4
                ),
                "error_message": final_error
            }
        }), 200

    @app.post("/api/problems/<int:problem_id>/submit")
    @jwt_required()
    def submit_code(problem_id):
        """Submit code for a problem."""

        student_id = int(get_jwt_identity())

        problem = db.session.get(
            Problem,
            problem_id
        )

        if problem is None:
            return jsonify({
                "message": "Problem not found."
            }), 404

        data = request.get_json() or {}

        code = data.get("code")
        language = data.get("language", "python")

        if not code:
            return jsonify({
                "message": "Code is required."
            }), 400

        if language.lower() != "python":
            return jsonify({
                "message": "Currently only Python submissions are supported."
            }), 400

        submission = Submission(
            code=code,
            language="python",
            status="pending",
            score=0,
            student_id=student_id,
            problem_id=problem_id
        )

        db.session.add(submission)
        db.session.commit()

        test_cases = problem.test_cases

        if not test_cases:
            submission.status = "No Test Cases"

            db.session.commit()

            return jsonify({
                "message": (
                    "Submission created, but this problem "
                    "has no test cases."
                ),
                "submission": {
                    "id": submission.id,
                    "status": submission.status,
                    "score": submission.score
                }
            }), 200

        passed = 0
        total = len(test_cases)
        total_execution_time = 0

        final_status = "Accepted"
        final_error = None

        for test_case in test_cases:
            result = run_python_code(
                code,
                test_case.input_data
            )

            total_execution_time += result["execution_time"]

            if result["status"] == "Time Limit Exceeded":
                final_status = "Time Limit Exceeded"
                final_error = result["error_message"]
                break

            if result["status"] in [
                "Runtime Error",
                "Execution Error"
            ]:
                final_status = result["status"]
                final_error = result["error_message"]
                break

            actual_output = result["output"].strip()
            expected_output = test_case.expected_output.strip()

            if actual_output == expected_output:
                passed += 1
            else:
                final_status = "Wrong Answer"
                break

        score = int(
            (passed / total) * 100
        )

        if passed != total and final_status == "Accepted":
            final_status = "Wrong Answer"

        submission.status = final_status
        submission.score = score
        submission.execution_time = total_execution_time
        submission.error_message = final_error

        db.session.commit()

        return jsonify({
            "message": "Code submitted successfully.",
            "submission": {
                "id": submission.id,
                "status": submission.status,
                "score": submission.score,
                "execution_time": round(
                    submission.execution_time,
                    4
                ),
                "error_message": submission.error_message
            }
        }), 201

    @app.get("/api/submissions")
    @jwt_required()
    def get_submissions():
        """Return the logged-in student's submissions."""

        student_id = int(get_jwt_identity())

        submissions = Submission.query.filter_by(
            student_id=student_id
        ).order_by(
            Submission.created_at.desc()
        ).all()

        result = []

        for submission in submissions:
            result.append({
                "id": submission.id,
                "problem_id": submission.problem_id,
                "language": submission.language,
                "status": submission.status,
                "score": submission.score,
                "execution_time": submission.execution_time,
                "error_message": submission.error_message,
                "created_at": (
                    submission.created_at.isoformat()
                    if submission.created_at
                    else None
                )
            })

        return jsonify({
            "count": len(result),
            "submissions": result
        }), 200

    @app.get("/api/submissions/<int:submission_id>")
    @jwt_required()
    def get_submission(submission_id):
        """Return one submission belonging to the logged-in student."""

        student_id = int(get_jwt_identity())

        submission = db.session.get(
            Submission,
            submission_id
        )

        if submission is None:
            return jsonify({
                "message": "Submission not found."
            }), 404

        if submission.student_id != student_id:
            return jsonify({
                "message": "You can only view your own submissions."
            }), 403

        return jsonify({
            "submission": {
                "id": submission.id,
                "problem_id": submission.problem_id,
                "language": submission.language,
                "status": submission.status,
                "score": submission.score,
                "execution_time": submission.execution_time,
                "error_message": submission.error_message,
                "created_at": (
                    submission.created_at.isoformat()
                    if submission.created_at
                    else None
                )
            }
        }), 200