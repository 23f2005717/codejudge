
from flask import jsonify, request

from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from .extensions import db

from .models.problem import Problem

from .models.testcase import TestCase


def register_testcase_routes(app):
    @app.post("/api/problems/<int:problem_id>/testcases")
    @jwt_required()
    def create_testcase(problem_id):
        """Add a test case to a problem."""
        claims = get_jwt()
        # Only instructors can create test cases.
        if claims.get("role") != "instructor":
            return jsonify({
                "message": "Only instructors can add test cases."
            }), 403
        problem = db.session.get(Problem, problem_id)
        if problem is None:
            return jsonify({
                "message": "Problem not found."
            }), 404
        instructor_id = int(get_jwt_identity())
        # An instructor can only modify their own problem.
        if problem.instructor_id != instructor_id:
            return jsonify({
                "message": "You can only add test cases to your own problems."
            }), 403
        data = request.get_json() or {}
        input_data = data.get("input_data")
        expected_output = data.get("expected_output")
        is_sample = data.get("is_sample", False)
        if input_data is None or expected_output is None:
            return jsonify({
                "message": "Input data and expected output are required."
            }), 400
        testcase = TestCase(
            input_data=input_data,
            expected_output=expected_output,
            is_sample=is_sample,
            problem_id=problem_id
        )
        db.session.add(testcase)
        db.session.commit()
        return jsonify({
            "message": "Test case created successfully.",
            "testcase": {
                "id": testcase.id,
                "input_data": testcase.input_data,
                "expected_output": testcase.expected_output,
                "is_sample": testcase.is_sample,
                "problem_id": testcase.problem_id,
                "created_at": (
                    testcase.created_at.isoformat()
                    if testcase.created_at
                    else None
                )
            }
        }), 201

    @app.get("/api/problems/<int:problem_id>/testcases")
    @jwt_required()
    def get_testcases(problem_id):
        """Return test cases for a problem."""
        problem = db.session.get(Problem, problem_id)
        if problem is None:
            return jsonify({
                "message": "Problem not found."
            }), 404
        testcases = TestCase.query.filter_by(
            problem_id=problem_id
        ).order_by(TestCase.id.asc()).all()
        claims = get_jwt()
        result = []
        for testcase in testcases:
            # Hidden test cases should not be exposed to students.
            if not testcase.is_sample and claims.get("role") == "student":
                continue
            result.append({
                "id": testcase.id,
                "input_data": testcase.input_data,
                "expected_output": testcase.expected_output,
                "is_sample": testcase.is_sample,
                "problem_id": testcase.problem_id,
                "created_at": (
                    testcase.created_at.isoformat()
                    if testcase.created_at
                    else None
                )
            })
        return jsonify({
            "problem_id": problem_id,
            "testcases": result,
            "count": len(result)
        }), 200

    @app.put("/api/testcases/<int:testcase_id>")
    @jwt_required()
    def update_testcase(testcase_id):
        """Update an existing test case."""
        claims = get_jwt()
        if claims.get("role") != "instructor":
            return jsonify({
                "message": "Only instructors can update test cases."
            }), 403
        testcase = db.session.get(TestCase, testcase_id)
        if testcase is None:
            return jsonify({
                "message": "Test case not found."
            }), 404
        instructor_id = int(get_jwt_identity())
        if testcase.problem.instructor_id != instructor_id:
            return jsonify({
                "message": "You can only update your own test cases."
            }), 403
        data = request.get_json() or {}
        if "input_data" in data:
            testcase.input_data = data["input_data"]
        if "expected_output" in data:
            testcase.expected_output = data["expected_output"]
        if "is_sample" in data:
            testcase.is_sample = data["is_sample"]
        db.session.commit()
        return jsonify({
            "message": "Test case updated successfully.",
            "testcase": {
                "id": testcase.id,
                "input_data": testcase.input_data,
                "expected_output": testcase.expected_output,
                "is_sample": testcase.is_sample,
                "problem_id": testcase.problem_id,
                "created_at": (
                    testcase.created_at.isoformat()
                    if testcase.created_at
                    else None
                )
            }
        }), 200

    @app.delete("/api/testcases/<int:testcase_id>")
    @jwt_required()
    def delete_testcase(testcase_id):
        """Delete an existing test case."""
        claims = get_jwt()
        if claims.get("role") != "instructor":
            return jsonify({
                "message": "Only instructors can delete test cases."
            }), 403
        testcase = db.session.get(TestCase, testcase_id)
        if testcase is None:
            return jsonify({
                "message": "Test case not found."
            }), 404
        instructor_id = int(get_jwt_identity())
        if testcase.problem.instructor_id != instructor_id:
            return jsonify({
                "message": "You can only delete your own test cases."
            }), 403
        db.session.delete(testcase)
        db.session.commit()
        return jsonify({
            "message": "Test case deleted successfully."
        }), 200









































# from flask import jsonify, request
# from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

# from .extensions import db
# from .models.problem import Problem
# from .models.testcase import TestCase


# def register_testcase_routes(app):

#     @app.post("/api/problems/<int:problem_id>/testcases")
#     @jwt_required()
#     def create_testcase(problem_id):
#         """Add a test case to a problem."""

#         claims = get_jwt()

#         # Only instructors can create test cases.
#         if claims.get("role") != "instructor":
#             return jsonify({
#                 "message": "Only instructors can add test cases."
#             }), 403

#         problem = db.session.get(Problem, problem_id)

#         if problem is None:
#             return jsonify({
#                 "message": "Problem not found."
#             }), 404

#         instructor_id = int(get_jwt_identity())

#         # An instructor can only modify their own problem.
#         if problem.instructor_id != instructor_id:
#             return jsonify({
#                 "message": "You can only add test cases to your own problems."
#             }), 403

#         data = request.get_json() or {}

#         input_data = data.get("input_data")
#         expected_output = data.get("expected_output")
#         is_sample = data.get("is_sample", False)

#         if input_data is None or expected_output is None:
#             return jsonify({
#                 "message": "Input data and expected output are required."
#             }), 400

#         testcase = TestCase(
#             input_data=input_data,
#             expected_output=expected_output,
#             is_sample=is_sample,
#             problem_id=problem_id
#         )

#         db.session.add(testcase)
#         db.session.commit()

#         return jsonify({
#             "message": "Test case created successfully.",
#             "testcase": {
#                 "id": testcase.id,
#                 "input_data": testcase.input_data,
#                 "expected_output": testcase.expected_output,
#                 "is_sample": testcase.is_sample,
#                 "problem_id": testcase.problem_id
#             }
#         }), 201

#     @app.get("/api/problems/<int:problem_id>/testcases")
#     @jwt_required()
#     def get_testcases(problem_id):
#         """Return test cases for a problem."""

#         problem = db.session.get(Problem, problem_id)

#         if problem is None:
#             return jsonify({
#                 "message": "Problem not found."
#             }), 404

#         testcases = TestCase.query.filter_by(
#             problem_id=problem_id
#         ).order_by(TestCase.id.asc()).all()

#         claims = get_jwt()

#         result = []

#         for testcase in testcases:

#             # Hidden test cases should not be exposed to students.
#             if not testcase.is_sample and claims.get("role") == "student":
#                 continue

#             result.append({
#                 "id": testcase.id,
#                 "input_data": testcase.input_data,
#                 "expected_output": testcase.expected_output,
#                 "is_sample": testcase.is_sample,
#                 "problem_id": testcase.problem_id
#             })

#         return jsonify({
#             "problem_id": problem_id,
#             "testcases": result,
#             "count": len(result)
#         }), 200

#     @app.put("/api/testcases/<int:testcase_id>")
#     @jwt_required()
#     def update_testcase(testcase_id):
#         """Update an existing test case."""

#         claims = get_jwt()

#         if claims.get("role") != "instructor":
#             return jsonify({
#                 "message": "Only instructors can update test cases."
#             }), 403

#         testcase = db.session.get(TestCase, testcase_id)

#         if testcase is None:
#             return jsonify({
#                 "message": "Test case not found."
#             }), 404

#         instructor_id = int(get_jwt_identity())

#         if testcase.problem.instructor_id != instructor_id:
#             return jsonify({
#                 "message": "You can only update your own test cases."
#             }), 403

#         data = request.get_json() or {}

#         if "input_data" in data:
#             testcase.input_data = data["input_data"]

#         if "expected_output" in data:
#             testcase.expected_output = data["expected_output"]

#         if "is_sample" in data:
#             testcase.is_sample = data["is_sample"]

#         db.session.commit()

#         return jsonify({
#             "message": "Test case updated successfully.",
#             "testcase": {
#                 "id": testcase.id,
#                 "input_data": testcase.input_data,
#                 "expected_output": testcase.expected_output,
#                 "is_sample": testcase.is_sample,
#                 "problem_id": testcase.problem_id
#             }
#         }), 200

#     @app.delete("/api/testcases/<int:testcase_id>")
#     @jwt_required()
#     def delete_testcase(testcase_id):
#         """Delete an existing test case."""

#         claims = get_jwt()

#         if claims.get("role") != "instructor":
#             return jsonify({
#                 "message": "Only instructors can delete test cases."
#             }), 403

#         testcase = db.session.get(TestCase, testcase_id)

#         if testcase is None:
#             return jsonify({
#                 "message": "Test case not found."
#             }), 404

#         instructor_id = int(get_jwt_identity())

#         if testcase.problem.instructor_id != instructor_id:
#             return jsonify({
#                 "message": "You can only delete your own test cases."
#             }), 403

#         db.session.delete(testcase)
#         db.session.commit()

#         return jsonify({
#             "message": "Test case deleted successfully."
#         }), 200