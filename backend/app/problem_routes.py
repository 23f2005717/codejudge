from flask import jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from .extensions import db
from .models.problem import Problem


def register_problem_routes(app):

    @app.post("/api/problems")
    @jwt_required()
    def create_problem():
        """Create a new coding problem."""

        claims = get_jwt()

        # Only instructors can create problems.
        if claims.get("role") != "instructor":
            return jsonify({
                "message": "Only instructors can create problems."
            }), 403

        data = request.get_json() or {}

        title = data.get("title")
        description = data.get("description")
        difficulty = data.get("difficulty", "easy")

        if not title or not description:
            return jsonify({
                "message": "Title and description are required."
            }), 400

        if difficulty not in ["easy", "medium", "hard"]:
            return jsonify({
                "message": "Difficulty must be easy, medium, or hard."
            }), 400

        problem = Problem(
            title=title,
            description=description,
            difficulty=difficulty,
            input_format=data.get("input_format"),
            output_format=data.get("output_format"),
            constraints=data.get("constraints"),
            is_published=data.get("is_published", False),
            instructor_id=int(get_jwt_identity())
        )

        db.session.add(problem)
        db.session.commit()

        return jsonify({
            "message": "Problem created successfully.",
            "problem": {
                "id": problem.id,
                "title": problem.title,
                "description": problem.description,
                "difficulty": problem.difficulty,
                "input_format": problem.input_format,
                "output_format": problem.output_format,
                "constraints": problem.constraints,
                "is_published": problem.is_published,
                "instructor_id": problem.instructor_id
            }
        }), 201

    @app.get("/api/problems")
    def get_problems():
        """Return the list of available problems."""

        problems = Problem.query.order_by(
            Problem.created_at.desc()
        ).all()

        result = []

        for problem in problems:
            result.append({
                "id": problem.id,
                "title": problem.title,
                "description": problem.description,
                "difficulty": problem.difficulty,
                "input_format": problem.input_format,
                "output_format": problem.output_format,
                "constraints": problem.constraints,
                "is_published": problem.is_published
            })

        return jsonify({
            "problems": result,
            "count": len(result)
        }), 200

    @app.get("/api/problems/<int:problem_id>")
    def get_problem(problem_id):
        """Return one problem."""

        problem = db.session.get(Problem, problem_id)

        if problem is None:
            return jsonify({
                "message": "Problem not found."
            }), 404

        return jsonify({
            "problem": {
                "id": problem.id,
                "title": problem.title,
                "description": problem.description,
                "difficulty": problem.difficulty,
                "input_format": problem.input_format,
                "output_format": problem.output_format,
                "constraints": problem.constraints,
                "is_published": problem.is_published,
                "instructor_id": problem.instructor_id
            }
        }), 200

    @app.put("/api/problems/<int:problem_id>")
    @jwt_required()
    def update_problem(problem_id):
        """Update a problem owned by the instructor."""

        claims = get_jwt()

        if claims.get("role") != "instructor":
            return jsonify({
                "message": "Only instructors can update problems."
            }), 403

        problem = db.session.get(Problem, problem_id)

        if problem is None:
            return jsonify({
                "message": "Problem not found."
            }), 404

        instructor_id = int(get_jwt_identity())

        if problem.instructor_id != instructor_id:
            return jsonify({
                "message": "You can only update your own problems."
            }), 403

        data = request.get_json() or {}

        if "title" in data:
            problem.title = data["title"]

        if "description" in data:
            problem.description = data["description"]

        if "difficulty" in data:
            if data["difficulty"] not in ["easy", "medium", "hard"]:
                return jsonify({
                    "message": "Difficulty must be easy, medium, or hard."
                }), 400

            problem.difficulty = data["difficulty"]

        if "input_format" in data:
            problem.input_format = data["input_format"]

        if "output_format" in data:
            problem.output_format = data["output_format"]

        if "constraints" in data:
            problem.constraints = data["constraints"]

        if "is_published" in data:
            problem.is_published = data["is_published"]

        db.session.commit()

        return jsonify({
            "message": "Problem updated successfully.",
            "problem": {
                "id": problem.id,
                "title": problem.title,
                "description": problem.description,
                "difficulty": problem.difficulty,
                "input_format": problem.input_format,
                "output_format": problem.output_format,
                "constraints": problem.constraints,
                "is_published": problem.is_published
            }
        }), 200

    @app.delete("/api/problems/<int:problem_id>")
    @jwt_required()
    def delete_problem(problem_id):
        """Delete a problem owned by the instructor."""

        claims = get_jwt()

        if claims.get("role") != "instructor":
            return jsonify({
                "message": "Only instructors can delete problems."
            }), 403

        problem = db.session.get(Problem, problem_id)

        if problem is None:
            return jsonify({
                "message": "Problem not found."
            }), 404

        instructor_id = int(get_jwt_identity())

        if problem.instructor_id != instructor_id:
            return jsonify({
                "message": "You can only delete your own problems."
            }), 403

        db.session.delete(problem)
        db.session.commit()

        return jsonify({
            "message": "Problem deleted successfully."
        }), 200