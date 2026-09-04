import os
import subprocess
import tempfile
import time


DOCKER_IMAGE = "codejudge-python"

MEMORY_LIMIT = "128m"
CPU_LIMIT = "0.5"
PROCESS_LIMIT = "64"


def run_python_code(code, input_data, time_limit=3):
    """
    Run one Python submission inside an isolated Docker container.

    Returns:
        status
        output
        execution_time
        error_message
    """

    file_path = None
    container_name = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8"
        ) as file:
            file.write(code)
            file_path = file.name

        
        container_name = f"codejudge-run-{os.getpid()}-{int(time.time() * 1000)}"

        command = [
            "docker",
            "run",
            "--name", container_name,
            "--rm",
            "-i",

            
            "--network", "none",

            
            "--memory", MEMORY_LIMIT,
            "--cpus", CPU_LIMIT,
            "--pids-limit", PROCESS_LIMIT,

            
            "--read-only",

            "--tmpfs", "/tmp:rw,noexec,nosuid,size=16m",

            "-e", "PYTHONDONTWRITEBYTECODE=1",

            "-v", f"{file_path}:/code/submission.py:ro",

            DOCKER_IMAGE,
            "python",
            "/code/submission.py",
        ]

        start_time = time.perf_counter()

        process = subprocess.Popen(
            command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        try:
            stdout, stderr = process.communicate(
                input=input_data,
                timeout=time_limit
            )

        except subprocess.TimeoutExpired:
            process.kill()

            try:
                process.communicate(timeout=2)
            except subprocess.TimeoutExpired:
                pass

            subprocess.run(
                ["docker", "rm", "-f", container_name],
                capture_output=True,
                text=True
            )

            
            execution_time = time.perf_counter() - start_time

            return {
                "status": "Time Limit Exceeded",
                "output": "",
                "execution_time": execution_time,
                "error_message": "The program exceeded the time limit."
            }

        execution_time = time.perf_counter() - start_time

        output = stdout.strip()
        error = stderr.strip()

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

    except FileNotFoundError:
        return {
            "status": "Execution Error",
            "output": "",
            "execution_time": 0,
            "error_message": "Docker CLI was not found."
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