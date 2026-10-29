import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import type { ExerciseData } from "./exercises";
import type { ExecutionResult, TestCase, TestResult } from "./types";
import { analyzeCode } from "./analysis";

export function executionMode(): "preview" | "sandbox" {
  return process.env.EXECUTION_MODE === "sandbox" ? "sandbox" : "preview";
}
function previewReference(slug: string, correct: boolean, args: unknown[]): unknown {
  switch (slug) {
    case "fizzbuzz": return Array.from({ length: Math.max(0, args[0] as number) }, (_, i) => {
      const n = i + 1;
      if (correct && n % 15 === 0) return "FizzBuzz";
      if (n % 3 === 0) return "Fizz";
      if (n % 5 === 0) return "Buzz";
      if (!correct && n % 15 === 0) return "Fizz";
      return String(n);
    });
    case "reverse-a-string": return correct ? Array.from(args[0] as string).reverse().join("") : args[0];
    case "largest-number": return correct ? Math.max(...args[0] as number[]) : Math.max(0, ...args[0] as number[]);
    case "count-vowels": return Array.from(args[0] as string).filter((c) => (correct ? c.toLowerCase() : c).match(/[aeiou]/)).length;
    case "prime-number": { const n = args[0] as number; if (correct && n < 2) return false; for (let d = 2; d <= Math.sqrt(n); d++) if (n % d === 0) return false; return true; }
    case "sum-even-numbers": return (args[0] as number[]).filter((n) => n % 2 === (correct ? 0 : 1)).reduce((a, b) => a + b, 0);
    case "first-duplicate": { if (!correct) return (args[0] as unknown[])[0] ?? null; const seen = new Set(); for (const value of args[0] as unknown[]) { if (seen.has(value)) return value; seen.add(value); } return null; }
    default: { const n = args[0] as number; return n > 90 ? "A" : n > 80 ? "B" : n > 70 ? "C" : n > 60 ? "D" : "F"; }
  }
}
// Deliberately a static mock, not a Python interpreter. Only recognized patterns
// receive illustrative results. Arbitrary Python is never evaluated on the host.
export function runPreview(exercise: ExerciseData, code: string): ExecutionResult {
  const start = performance.now();
  const normalized = code.replace(/#.*$/gm, "").replace(/\s+/g, " ").replace(/'/g, '"');
  const analysis = analyzeCode(exercise, code);
  const base = { mode: "preview" as const, durationMs: 0, notice: "Local preview mode · static pattern checks, not Python execution. Results are illustrative; use the Docker runner to verify your code." };
  const name = exercise.functionName;
  if (!new RegExp(`def ${name}\\s*\\(`).test(normalized)) return {
    ...base, status: "error", stdout: "", errorMessage: `Preview cannot find ${name}(...). Define the expected function, or use the sandbox runner for a full Python check.`, tests: [],
  };
  const signatures: Record<string, RegExp> = {
    fizzbuzz: /range\(1, n \+ 1\).*% 3.*% 5.*append\(str\(number\)\)/,
    "reverse-a-string": /for character in text:.*reversed_text = reversed_text \+ character|return text\[::-1\]|return "".join\(reversed\(text\)\)|reversed_text = character \+ reversed_text/,
    "largest-number": /largest = (0|numbers\[0\]).*for number in numbers:.*if number > largest:|return max\(numbers\)/,
    "count-vowels": /vowels = "[^"]+".*for character in word:.*if character(?:\.lower\(\)|\.upper\(\)|\.casefold\(\))? in vowels:/,
    "prime-number": /for divisor in range\(2, int\(n \*\* 0.5\) \+ 1\):.*if n % divisor == 0:.*return False.*return True/,
    "sum-even-numbers": /for number in numbers:.*if number % 2 == [01]:.*total \+= number/,
    "first-duplicate": /seen = set\(\).*for number in numbers:.*(?:seen.add\(number\).*if number in seen:|if number in seen:.*seen.add\(number\))/,
    "grade-calculator": /if score >=? 90:.*return "A".*elif score > 80:.*return "B".*elif score > 70:.*return "C".*elif score > 60:.*return "D".*return "F"/,
  };
  if (!signatures[exercise.slug]?.test(normalized)) return {
    ...base, status: "error", stdout: "", tests: [],
    errorMessage: "This implementation is outside the safe preview’s small pattern library. No Python was executed and correctness is unknown. Configure EXECUTION_MODE=sandbox to run real tests; hints are still available.",
  };
  const tests: TestResult[] = exercise.testCases.map((test: TestCase) => {
    const actual = previewReference(exercise.slug, analysis.correct, test.args);
    return { name: test.name, passed: JSON.stringify(actual) === JSON.stringify(test.expected), hidden: test.hidden,
      ...(test.hidden ? {} : { args: test.args, expected: test.expected, actual }) };
  });
  return { ...base, status: tests.every((test) => test.passed) ? "passed" : "failed", tests,
    stdout: `[Preview estimate — not stdout]\nRecognized ${analysis.correct ? "a supported corrected pattern" : "a common beginner pattern"} for ${exercise.title}.\n${tests.filter((test) => test.passed).length}/${tests.length} illustrative checks match.`,
    errorMessage: null, durationMs: Math.round(performance.now() - start),
  };
}
export function redactTests(tests: TestResult[]): TestResult[] {
  return tests.map((test) => test.hidden ? { name: test.name, passed: test.passed, hidden: true } : test);
}
interface RunnerPayload { status: "passed" | "failed" | "error"; stdout: string; errorMessage: string | null; tests: (TestResult & { actual?: unknown; expected?: unknown; args?: unknown[] })[]; }
function validPayload(value: unknown): value is RunnerPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as RunnerPayload;
  return ["passed", "failed", "error"].includes(v.status) && typeof v.stdout === "string" &&
    (v.errorMessage === null || typeof v.errorMessage === "string") && Array.isArray(v.tests) &&
    v.tests.every((t) => typeof t.name === "string" && typeof t.passed === "boolean");
}
export async function runSandbox(exercise: ExerciseData, code: string): Promise<ExecutionResult> {
  const start = performance.now();
  const container = `selamcode-${randomUUID()}`;
  const timeout = Math.min(15000, Math.max(1000, Number(process.env.EXECUTION_TIMEOUT_MS) || 6000));
  const args = ["run", "--rm", "-i", "--name", container, "--network", "none", "--read-only",
    "--cap-drop", "ALL", "--security-opt", "no-new-privileges", "--pids-limit", "64",
    "--memory", "128m", "--memory-swap", "128m", "--cpus", "0.5", "--ulimit", "nofile=64:64",
    "--tmpfs", "/tmp:rw,noexec,nosuid,size=8m", "--user", "65534:65534",
    process.env.SANDBOX_IMAGE || "selamcode-python:latest"];
  const input = JSON.stringify({ code, function_name: exercise.functionName, tests: exercise.testCases });
  const payload = await new Promise<RunnerPayload>((resolve, reject) => {
    const child = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    let stdout = "", stderr = "", settled = false, timedOut = false;
    const kill = () => { void new Promise<void>((done) => { const cleanup = spawn("docker", ["rm", "-f", container], { stdio: "ignore" }); cleanup.on("error", () => done()); cleanup.on("close", () => done()); }); child.kill("SIGKILL"); };
    const finish = (error?: Error, value?: RunnerPayload) => { if (settled) return; settled = true; clearTimeout(timer); if (error) reject(error); else resolve(value!); };
    const timer = setTimeout(() => { timedOut = true; kill(); finish(new Error("Execution stopped after the time limit. Check for an infinite loop.")); }, timeout);
    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); if (stdout.length > 262144) { kill(); finish(new Error("The runner returned too much output.")); } });
    child.stderr.on("data", (chunk: Buffer) => { stderr = (stderr + chunk.toString()).slice(-4096); });
    child.on("error", () => finish(new Error("Docker is unavailable. Start Docker and build the Python runner image, or explicitly select preview mode.")));
    child.on("close", (exit) => {
      if (settled) return;
      if (timedOut) return;
      if (exit !== 0) { finish(new Error("The isolated runner could not start. Check that Docker is running and the runner image is built.")); return; }
      try {
        const marker = stdout.lastIndexOf("\nSELAM_RESULT:");
        const data: unknown = JSON.parse(marker < 0 ? stdout : stdout.slice(marker + 14).split("\n")[0]);
        if (!validPayload(data) || data.tests.length !== exercise.testCases.length) throw new Error("Invalid result");
        finish(undefined, data);
      } catch { finish(new Error("The runner returned an invalid result. No test pass was recorded.")); }
    });
    child.stdin.on("error", () => { /* close/error above provides the actionable failure */ });
    child.stdin.end(input);
  });
  return { mode: "sandbox", status: payload.status, stdout: payload.stdout.slice(0, 16000), errorMessage: payload.errorMessage,
    notice: "Executed in an isolated Python container: no network, read-only filesystem, 128 MB memory, CPU and time limits.",
    tests: payload.tests.map((test, i) => ({ name: exercise.testCases[i].name, hidden: exercise.testCases[i].hidden, passed: test.passed,
      ...(!exercise.testCases[i].hidden ? { args: exercise.testCases[i].args, expected: exercise.testCases[i].expected, actual: test.actual } : {}),
      ...(test.error && !exercise.testCases[i].hidden ? { error: test.error.slice(0, 500) } : {}) })),
    durationMs: Math.round(performance.now() - start),
  };
}
export async function executeCode(exercise: ExerciseData, code: string) {
  return executionMode() === "sandbox" ? runSandbox(exercise, code) : runPreview(exercise, code);
}
export function errorCategory(result: Pick<ExecutionResult, "status" | "errorMessage" | "tests">) {
  if (result.status === "passed") return "No error";
  const error = result.errorMessage || "";
  if (/time limit|infinite loop/i.test(error)) return "Timeout";
  if (/outside the safe preview|cannot find/.test(error)) return "Preview limitation";
  if (/SyntaxError|IndentationError/.test(error)) return "Syntax / indentation";
  if (/NameError/.test(error)) return "Undefined name";
  if (/TypeError/.test(error)) return "Type mismatch";
  if (/IndexError/.test(error)) return "Index out of range";
  if (/ZeroDivisionError/.test(error)) return "Division by zero";
  if (/AttributeError/.test(error)) return "Attribute error";
  if (result.status === "error") return "Other runtime error";
  return "Incorrect output";
}
