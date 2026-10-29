import { createTwoFilesPatch } from "diff";
import type { ExerciseData } from "./exercises";

export interface CodeAnalysis {
  key: string; line: number | null; concept: string; observation: string;
  question: string; specific: string; patch: string | null; correct: boolean;
  amharic: { concept: string; observation: string; question: string; specific: string };
}
export function findLine(code: string, pattern: RegExp) {
  const index = code.split("\n").findIndex((line) => pattern.test(line));
  return index < 0 ? null : index + 1;
}
export function minimalPatch(code: string, line: number, replacement: string) {
  const lines = code.split("\n");
  if (line < 1 || line > lines.length) return null;
  lines[line - 1] = replacement;
  const patch = createTwoFilesPatch("student.py", "student.py", code, lines.join("\n"), "", "", { context: 2 });
  return patch;
}
function replaceLine(code: string, pattern: RegExp, replacement: string) {
  const line = findLine(code, pattern);
  return { line, patch: line === null ? null : minimalPatch(code, line, replacement) };
}
const am = {
  fizzbuzz: { concept: "በif እና elif መካከል ያለው ቅደም ተከተል አስፈላጊ ነው። የመጀመሪያው እውነት የሆነ ሁኔታ ብቻ ይፈጸማል።", observation: "ኮድህ ቁጥሮችን ይዞራል፤ ለ3 እና ለ5 ተካፋይነት ይመረምራል።", question: "አንድ ቁጥር ለ3ም ለ5ም ሲካፈል የትኛው ሁኔታ ቀድሞ ይፈጸማል?", specific: "ለሁለቱም ተካፋይ የሆነው ቁጥር በመጀመሪያው የ3 ሁኔታ ይያዛል። የሁለቱንም ሁኔታ ቅደም ተከተል መገምገም ይረዳል።" },
  reverse: { concept: "ሕብረ ቁምፊዎች ቅደም ተከተል አላቸው። አዲስ ፊደል መጨረሻ ላይ ወይም መጀመሪያ ላይ ማስቀመጥ የተለየ ውጤት ይሰጣል።", observation: "ኮድህ በእያንዳንዱ ፊደል ላይ ይዞራል እና ሕብረ ቁምፊ ይገነባል።", question: "አዲሱን ፊደል ከአሮጌው ውጤት ፊት ለፊት ብታስቀምጠው ምን ይቀየራል?", specific: "ፊደሎቹ በመጀመሪያ ቅደም ተከተላቸው ይጨመራሉ። የመጨመሪያውን አቅጣጫ መቀየር ወይም የተገላቢጦሽ slice መጠቀም ይቻላል።" },
  largest: { concept: "አንድን ትልቅ ዋጋ መከታተል የመነሻ ዋጋውን መምረጥን ይጨምራል። ዝርዝሩ ሙሉ በሙሉ አሉታዊ ሊሆን ይችላል።", observation: "ኮድህ እያንዳንዱን ቁጥር ከአሁኑ ትልቁ ዋጋ ጋር ያወዳድራል።", question: "ሁሉም ቁጥሮች ከዜሮ በታች ቢሆኑ የመነሻ ዋጋህ በዝርዝሩ ውስጥ ነው?", specific: "ዜሮን መነሻ ማድረግ በዝርዝሩ ውስጥ የሌለ መልስ ሊሰጥ ይችላል። ከመጀመሪያው የዝርዝር አባል መጀመር አስብ።" },
  vowels: { concept: "Python ፊደላትን በትልቅ እና ትንህ ቅርጽ እንደ ተለያዩ ቁምፊዎች ይመለከታል።", observation: "ኮድህ እያንዳንዱን ፊደል ከአናብዕቶች ዝርዝር ጋር ያወዳድራል።", question: "ትልቁ A እና ትንሹ a በኮድህ ውስጥ እኩል ይታያሉ?", specific: "የአናብዕቶች ዝርዝርህ ትናንሽ ፊደላት ብቻ ይዟል። ከማወዳደር በፊት የፊደላትን ቅርጽ ማስተካከል ይረዳል።" },
  prime: { concept: "ወሰኖችን መፈተሽ የአንድን አልጎሪዝም ትክክለኛነት ይወስናል። ዋጋው ከአንድ በላይ መሆን አለበት።", observation: "ኮድህ አካፋዮችን በመፈተሽ ቁጥሩ prime መሆኑን ይመረምራል።", question: "ከ2 በታች ለሆኑ ቁጥሮች loop መፈጸም አለመፈጸሙን ፈትሽ።", specific: "ከ2 በታች የሆኑ ቁጥሮች ሳይመረመሩ True ያገኛሉ። ከloop በፊት የመግቢያ ወሰን መጨመር ያስፈልጋል።" },
  even: { concept: "የሞዱሎ ምልክት የቀሪውን ዋጋ ይመልሳል። ለ2 ሲካፈል ቀሪው ዜሮ ከሆነ ቁጥሩ even ነው።", observation: "ኮድህ ቁጥሮችን ይመረምራል እና የሚመረጡትን ይደምራል።", question: "ለ2 ያልሆነ ቁጥር ሲካፈል ቀሪው ምንድን ነው? ዜሮስ?", specific: "ሁኔታህ odd ቁጥሮችን ይመርጣል። የeven ቁጥርን ቀሪ ከዜሮ ጋር ማወዳደር አስብ።" },
  duplicate: { concept: "አንድን ዋጋ ማስታወስ እና ወደ ዝርዝር መጨመር የተለያዩ ደረጃዎች ናቸው።", observation: "ኮድህ የተመለከታቸውን ዋጋዎች በset ውስጥ ያስቀምጣል።", question: "አንድን ቁጥር ከመጨመር በፊት እና በኋላ ቢፈትሽው ልዩነቱ ምንድን ነው?", specific: "ቁጥሩን ወደ set ከጨመርክ በኋላ ሁልጊዜ በውስጡ ይገኛል። መፈተሽና ማስቀመጥ ቅደም ተከተላቸውን መቀየር አለባቸው።" },
  grade: { concept: "የወሰን ሁኔታዎች እኩል የሆነውን ዋጋ መጨመር አለመጨመራቸውን መለየት አስፈላጊ ነው።", observation: "ኮድህ የቁጥር ውጤትን ወደ ደረጃ ፊደል ይቀይራል።", question: "ውጤቱ በትክክል 90 ቢሆን የትኛውን ደረጃ ይመልሳል?", specific: "የመጀመሪያው ሁኔታ 90ን አያካትትም። ወሰኑን በሚመለከተው የንጽጽር ምልክት ላይ ትኩረት አድርግ።" },
};

export function analyzeCode(exercise: ExerciseData, code: string): CodeAnalysis {
  const clean = code.replace(/#.*$/gm, "").replace(/\s+/g, " ").replace(/'/g, '"');
  let result: Omit<CodeAnalysis, "amharic">;
  let patch: string | null = null;
  let correct = false;
  switch (exercise.slug) {
    case "fizzbuzz": {
      correct = /if[^:]*% 15[^:]*:/.test(clean) && clean.indexOf("15") < clean.indexOf("% 3");
      const branchLine = findLine(code, /if .*% 3 == 0/);
      if (branchLine !== null) {
        const lines = code.split("\n");
        const indent = lines[branchLine - 1].match(/^\s*/)?.[0] ?? "        ";
        // Insert a new, earlier branch for the combined case rather than overwriting
        // the existing %3 branch, so the Fizz-only case is never lost.
        lines.splice(branchLine - 1, 1,
          `${indent}if number % 15 == 0:`, `${indent}    result.append("FizzBuzz")`,
          `${indent}elif number % 3 == 0:`);
        patch = createTwoFilesPatch("student.py", "student.py", code, lines.join("\n"), "", "", { context: 2 });
      }
      result = { key: "branch-order", line: branchLine, concept: "An if/elif chain runs only its first true branch. More specific conditions need to come before general ones.", observation: "Your loop checks divisibility and builds a label for each number. A number divisible by both 3 and 5 can match the earlier branch.", question: "Trace the number 15 by hand. Which condition catches it first, and which condition would you want to catch it?", specific: "The combined FizzBuzz case is placed after the single-divisor cases, so it cannot run. Check both divisors first; keep the other branches as they are.", patch, correct };
      break;
    }
    case "reverse-a-string": {
      correct = /\[::-1\]|reversed\(|join\(|\+ reversed_text|character \+/.test(clean);
      const located = replaceLine(code, /reversed_text = reversed_text \+ character/, "        reversed_text = character + reversed_text");
      result = { key: "accumulation-order", ...located, concept: "String concatenation is not commutative: putting new text before or after an accumulated string gives different results.", observation: "Your function visits each character and adds it to an accumulating string, keeping the original left-to-right order.", question: "After reading h and then e, you have he. Where would putting e at the front leave you?", specific: "Each new character goes at the end, so the string is copied rather than reversed. Consider building from the front instead, or using a reversed slice.", patch: located.patch, correct };
      break;
    }
    case "largest-number": {
      correct = /largest = numbers\[0\]|largest = max\(|return max\(/.test(clean);
      const located = replaceLine(code, /largest = 0/, "    largest = numbers[0]");
      result = { key: "initial-value", ...located, concept: "A running maximum needs an initial candidate that actually belongs to the input. Otherwise the answer might not be in the list.", observation: "Your function starts with a candidate maximum, then updates it when it finds a larger number.", question: "Try [-8, -3, -12]. Does your starting candidate belong to that list, and can any item replace it?", specific: "Starting at zero makes zero win against an all-negative list. Initialize the candidate from the first list element instead.", patch: located.patch, correct };
      break;
    }
    case "count-vowels": {
      correct = /\.lower\(\)|\.upper\(\)|\.casefold\(\)|aeiouAEIOU|AEIOUaeiou/.test(clean);
      const located = replaceLine(code, /if character in vowels/, "        if character.lower() in vowels:");
      result = { key: "case-sensitivity", ...located, concept: "Python comparisons are case-sensitive. A lowercase vowel set does not automatically match uppercase letters.", observation: "Your function counts characters that appear in a vowel string. The comparison currently distinguishes letter case.", question: "Would your membership check give the same answer for a and A? Try tracing Education.", specific: "Uppercase vowels are missed because the vowel collection is lowercase. Normalize letter case before the membership check, or include both cases.", patch: located.patch, correct };
      break;
    }
    case "prime-number": {
      correct = /if n < 2.*return False|if n <= 1.*return False/.test(clean);
      const line = findLine(code, /for divisor/);
      if (line !== null) {
        const lines = code.split("\n"); lines.splice(line - 1, 0, "    if n < 2:", "        return False");
        patch = createTwoFilesPatch("student.py", "student.py", code, lines.join("\n"), "", "", { context: 2 });
      }
      result = { key: "boundary-condition", line, concept: "A loop that never runs can fall through to a default return. Check the edges of the input domain, not just typical values.", observation: "Your function searches for a divisor and returns True when none is found. Small inputs may skip the loop entirely.", question: "What happens for 1 or 0? Does the loop run, and does the definition of a prime allow their result?", specific: "Numbers below 2 reach the final True without being checked. Add a boundary guard before the divisor loop.", patch, correct };
      break;
    }
    case "sum-even-numbers": {
      correct = /% 2 == 0|% 2 != 1|not .*% 2/.test(clean);
      const located = replaceLine(code, /if number % 2 == 1/, "        if number % 2 == 0:");
      result = { key: "predicate", ...located, concept: "The modulo operator gives a remainder. Even numbers leave no remainder when divided by two.", observation: "Your loop filters numbers with a remainder check and adds the selected numbers to a total.", question: "What remainder does 4 leave when divided by 2? What about 3? Which group is your condition selecting?", specific: "The condition tests for an odd-number remainder, so it sums the wrong group. Compare the remainder with the value that means even.", patch: located.patch, correct };
      break;
    }
    case "first-duplicate": {
      const membership = findLine(code, /if number in seen/);
      const add = findLine(code, /seen.add/);
      // Correct only when the membership check happens strictly before the value
      // is remembered; a single-line regex can't reliably tell order, so compare lines.
      correct = membership !== null && add !== null && membership < add;
      if (membership !== null && add !== null && add < membership) {
        const lines = code.split("\n"); const addText = lines[add - 1];
        lines.splice(add - 1, 1); lines.splice(membership, 0, addText);
        patch = createTwoFilesPatch("student.py", "student.py", code, lines.join("\n"), "", "", { context: 2 });
      }
      result = { key: "update-order", line: add, concept: "When tracking what you have seen before, checking history and updating history must happen in the right order.", observation: "Your function stores visited values in a set and checks membership as it scans the list.", question: "If you add today's number to seen before checking, can the check ever tell you whether it appeared on an earlier visit?", specific: "The current number is added before the membership check, making the first occurrence look repeated. Check first, then remember the value.", patch, correct };
      break;
    }
    default: {
      // The same off-by-boundary mistake (`>` instead of `>=`) repeats at every
      // threshold, so a genuinely minimal fix still needs to touch all four lines.
      correct = /score >= 90/.test(clean) && /score >= 80/.test(clean) && /score >= 70/.test(clean) && /score >= 60/.test(clean);
      const thresholds = [90, 80, 70, 60];
      const lines = code.split("\n");
      let firstLine: number | null = null;
      let changed = false;
      for (const threshold of thresholds) {
        const lineIndex = lines.findIndex((line) => new RegExp(`score > ${threshold}\\b`).test(line));
        if (lineIndex === -1) continue;
        if (firstLine === null) firstLine = lineIndex + 1;
        lines[lineIndex] = lines[lineIndex].replace(`score > ${threshold}`, `score >= ${threshold}`);
        changed = true;
      }
      const boundaryPatch = changed ? createTwoFilesPatch("student.py", "student.py", code, lines.join("\n"), "", "", { context: 2 }) : null;
      result = { key: "inclusive-boundary", line: firstLine, concept: "The comparison operators > and >= differ at exactly one value: the boundary. That value often deserves its own test.", observation: "Your function maps a numeric score to a letter using a chain of threshold comparisons.", question: "The task puts 90 in grade A, and 80 in grade B. Follow score = 90, then score = 80, through your conditions. Are they included?", specific: "Every threshold excludes its own boundary value, because > skips the case where the score exactly equals the cutoff. The same small change is needed at each comparison.", patch: boundaryPatch, correct };
    }
  }
  const slug = exercise.slug === "reverse-a-string" ? "reverse" : exercise.slug === "largest-number" ? "largest" : exercise.slug === "count-vowels" ? "vowels" : exercise.slug === "prime-number" ? "prime" : exercise.slug === "sum-even-numbers" ? "even" : exercise.slug === "first-duplicate" ? "duplicate" : exercise.slug === "grade-calculator" ? "grade" : "fizzbuzz";
  return { ...result, amharic: am[slug as keyof typeof am] };
}
