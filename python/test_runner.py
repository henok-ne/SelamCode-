"""Tests invoke the runner with trusted fixtures only; production uses Docker."""
import json
import subprocess
import sys
import unittest
from pathlib import Path

RUNNER = str(Path(__file__).with_name("runner.py"))
def run(code, name="solve", tests=None):
    tests = tests or [{"name": "example", "args": [2], "expected": 4, "hidden": False}]
    result = subprocess.run([sys.executable, "-I", "-S", RUNNER], input=json.dumps({"code": code, "function_name": name, "tests": tests}), capture_output=True, text=True, timeout=8)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return json.loads(result.stdout.split("\nSELAM_RESULT:", 1)[1])

class RunnerTests(unittest.TestCase):
    def test_correct_function(self):
        result = run("def solve(n):\n    return n * 2\n")
        self.assertEqual(result["status"], "passed")
        self.assertTrue(result["tests"][0]["passed"])
    def test_wrong_result(self):
        self.assertEqual(run("def solve(n):\n    return n + 3\n")["status"], "failed")
    def test_missing_function(self):
        self.assertEqual(run("x = 1")["status"], "error")
    def test_syntax_error(self):
        result = run("def solve(n)\n    return n")
        self.assertIn("SyntaxError", result["errorMessage"])
    def test_boolean_not_confused_with_integer(self):
        result = run("def solve(n):\n    return True\n", tests=[{"name":"bool", "args":[2], "expected":1,"hidden":False}])
        self.assertFalse(result["tests"][0]["passed"])
    def test_stdout_is_separate(self):
        result = run("def solve(n):\n    print('hello')\n    return n * 2\n")
        self.assertEqual(result["stdout"].strip(), "hello")
    def test_hidden_error_not_leaked(self):
        result = run("def solve(n):\n    raise ValueError('secret input')\n", tests=[{"name":"hidden","args":[2],"expected":4,"hidden":True}])
        self.assertNotIn("secret input", json.dumps(result))
    def test_timeout(self):
        result = run("def solve(n):\n    while True:\n        pass\n")
        self.assertEqual(result["status"], "error")
        self.assertIn("TimeoutError", result["errorMessage"])
    def test_output_limit(self):
        result = run("def solve(n):\n    print('x' * 20000)\n    return 4\n")
        self.assertIn("Output limit", result["errorMessage"])

if __name__ == "__main__":
    unittest.main()
