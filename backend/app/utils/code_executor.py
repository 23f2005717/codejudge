import subprocess
import sys
import tempfile
import time
import os


def run_python_code(code, input_data, time_limit=3):
    """
    Run a Python submission against one test case.

    Returns:
        status
        output
        execution_time
        error_message
    """

    file_path = None

    try:
        # Create a temporary Python file.
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8"
        ) as file:
            file.write(code)
            file_path = file.name

        start_time = time.perf_counter()

        process = subprocess.run(
            [sys.executable, file_path],
            input=input_data,
            text=True,
            capture_output=True,
            timeout=time_limit
        )

        execution_time = time.perf_counter() - start_time

        output = process.stdout.strip()
        error = process.stderr.strip()

        if process.returncode != 0:
            return {
                "status": "Runtime Error",
                "output": output,
                "execution_time": execution_time,
                "error_message": error
            }

        return {
            "status": "Executed",
            "output": output,
            "execution_time": execution_time,
            "error_message": None
        }

    except subprocess.TimeoutExpired:
        return {
            "status": "Time Limit Exceeded",
            "output": "",
            "execution_time": time_limit,
            "error_message": "The program exceeded the time limit."
        }

    except Exception as error:
        return {
            "status": "Execution Error",
            "output": "",
            "execution_time": 0,
            "error_message": str(error)
        }

    finally:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)