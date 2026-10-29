"""Run inside the disposable SelamCode container, never on the application host."""
import contextlib
import io
import json
import math
import resource
import signal
import sys
import traceback

MAX_OUTPUT = 16000

class LimitedOutput(io.StringIO):
    def write(self, text):
        remaining = MAX_OUTPUT - self.tell()
        if remaining <= 0:
            raise RuntimeError("Output limit reached (16,000 characters).")
        if len(text) > remaining:
            raise RuntimeError("Output limit reached (16,000 characters).")
        return super().write(text)

def serializable(value, depth=0):
    if depth > 8:
        raise ValueError("Result is nested too deeply.")
    if value is None or isinstance(value, (str, bool, int)):
        return value
    if isinstance(value, float):
        return value if math.isfinite(value) else str(value)
    if isinstance(value, (list, tuple)):
        if len(value) > 10000:
            raise ValueError("Result is too large.")
        return [serializable(item, depth + 1) for item in value]
    if isinstance(value, dict):
        return {str(key): serializable(item, depth + 1) for key, item in value.items()}
    if isinstance(value, (set, frozenset)):
        return {"set": sorted(repr(item) for item in value)}
    raise TypeError(f"Return a JSON-compatible value, not {type(value).__name__}.")

def main():
    resource.setrlimit(resource.RLIMIT_CPU, (5, 5))
    resource.setrlimit(resource.RLIMIT_FSIZE, (0, 0))
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    resource.setrlimit(resource.RLIMIT_AS, (112 * 1024 * 1024, 112 * 1024 * 1024))
    signal.signal(signal.SIGXFSZ, signal.SIG_IGN)
    def timed_out(_signum, _frame):
        raise TimeoutError("Execution stopped after the CPU time limit. Check for an infinite loop.")
    signal.signal(signal.SIGALRM, timed_out)
    signal.alarm(4)
    payload = json.loads(sys.stdin.read(262144))
    code = payload["code"]
    function_name = payload["function_name"]
    tests = payload["tests"]
    output = LimitedOutput()
    namespace = {"__name__": "__student__"}
    results = []
    error_message = None
    status = "passed"
    try:
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            exec(compile(code, "student.py", "exec"), namespace)
            function = namespace.get(function_name)
            if not callable(function):
                raise NameError(f"Define a function named {function_name}.")
            for test in tests:
                result = {"name": test["name"], "hidden": test["hidden"], "passed": False}
                try:
                    actual = serializable(function(*test["args"]))
                    result["actual"] = actual
                    result["passed"] = actual == test["expected"] and type(actual) is type(test["expected"])
                    if not result["passed"]:
                        status = "failed" if status != "error" else status
                except Exception as error:
                    result["error"] = f"{type(error).__name__}: {str(error)[:300]}" if not test["hidden"] else f"{type(error).__name__} in hidden check"
                    status = "error"
                    if error_message is None:
                        error_message = result["error"]
                results.append(result)
    except Exception as error:
        status = "error"
        error_message = f"{type(error).__name__}: {str(error)[:800]}"
        if isinstance(error, (SyntaxError, IndentationError)):
            error_message += f"\nLine: {getattr(error, 'lineno', 'unknown')}"
        else:
            error_message += "\n" + traceback.format_exc(limit=2)[-800:]
    signal.alarm(0)
    print("\nSELAM_RESULT:" + json.dumps({
        "status": status, "stdout": output.getvalue(), "errorMessage": error_message, "tests": results,
    }, ensure_ascii=False))

if __name__ == "__main__":
    main()
