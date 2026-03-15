/**
 * validate-quizzes.cjs
 * Run from the project root: node validate-quizzes.cjs
 *
 * Checks every JSON file under courses/ for:
 *   - Valid JSON syntax
 *   - Array of at least 1 question
 *   - Each question has a non-empty string "question" field
 *   - Each question has at least 2 answers
 *   - Each answer has a "text" string and a boolean "correct"
 *   - Exactly one answer is marked correct per question
 *
 * Also checks courses.json to confirm every catalog entry has a matching folder.
 */

const fs   = require("fs");
const path = require("path");

const ROOT         = __dirname;
const COURSES_DIR  = path.join(ROOT, "courses");
const CATALOG_FILE = path.join(ROOT, "courses.json");

let errors   = 0;
let warnings = 0;

function fail(context, message) {
    console.error("  ERROR [" + context + "] " + message);
    errors += 1;
}

function warn(context, message) {
    console.warn("  WARN  [" + context + "] " + message);
    warnings += 1;
}

function validateQuizFile(filePath) {
    const rel = path.relative(ROOT, filePath);
    let data;

    try {
        data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
        fail(rel, "JSON parse error — " + e.message);
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        fail(rel, "Root element must be a non-empty array.");
        return;
    }

    if (data.length !== 20) {
        warn(rel, "Expected 20 questions, found " + data.length + ".");
    }

    data.forEach(function(q, i) {
        var label = rel + " Q" + (i + 1);

        if (!q || typeof q.question !== "string" || q.question.trim() === "") {
            fail(label, "Missing or empty \"question\" field.");
        }

        if (!Array.isArray(q.answers) || q.answers.length < 2) {
            fail(label, "\"answers\" must be an array with at least 2 entries.");
            return;
        }

        var correctCount = 0;

        q.answers.forEach(function(a, j) {
            var alabel = label + " A" + (j + 1);
            if (typeof a.text !== "string" || a.text.trim() === "") {
                fail(alabel, "Missing or empty \"text\" field.");
            }
            if (typeof a.correct !== "boolean") {
                fail(alabel, "\"correct\" must be a boolean.");
            }
            if (a.correct === true) { correctCount += 1; }
        });

        if (correctCount !== 1) {
            fail(label, "Expected exactly 1 correct answer, found " + correctCount + ".");
        }
    });
}

function validateCatalog() {
    var rel = path.relative(ROOT, CATALOG_FILE);
    var catalog;

    try {
        catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, "utf8"));
    } catch (e) {
        fail(rel, "JSON parse error — " + e.message);
        return [];
    }

    if (!Array.isArray(catalog)) {
        fail(rel, "courses.json must be a JSON array.");
        return [];
    }

    catalog.forEach(function(course) {
        if (!course.id || !course.title || !course.description) {
            fail(rel, "Course entry missing id, title, or description: " + JSON.stringify(course));
        }
        var courseDir = path.join(COURSES_DIR, course.id);
        if (!fs.existsSync(courseDir)) {
            fail(rel, "Course id \"" + course.id + "\" has no matching folder under courses/.");
        }
    });

    var catalogIds = catalog.map(function(c) { return c.id; });

    if (fs.existsSync(COURSES_DIR)) {
        fs.readdirSync(COURSES_DIR).forEach(function(folderName) {
            var folderPath = path.join(COURSES_DIR, folderName);
            if (fs.statSync(folderPath).isDirectory() && !catalogIds.includes(folderName)) {
                warn("courses/", "Folder \"" + folderName + "\" exists but is not listed in courses.json.");
            }
        });
    }

    return catalogIds;
}

// ── Run ──────────────────────────────────────────────────────────────────────

console.log("Validating courses.json...\n");
var catalogIds = validateCatalog();

console.log("\nValidating quiz files...\n");

if (!fs.existsSync(COURSES_DIR)) {
    fail("courses/", "Directory does not exist.");
} else {
    fs.readdirSync(COURSES_DIR).forEach(function(courseFolder) {
        var courseDir = path.join(COURSES_DIR, courseFolder);
        if (!fs.statSync(courseDir).isDirectory()) { return; }

        var files = fs.readdirSync(courseDir).filter(function(f) {
            return f.endsWith(".json");
        });

        if (files.length === 0) {
            warn("courses/" + courseFolder, "No JSON files found.");
        }

        files.forEach(function(file) {
            validateQuizFile(path.join(courseDir, file));
        });
    });
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log("\n──────────────────────────────────────");
if (errors === 0 && warnings === 0) {
    console.log("All checks passed. No errors or warnings.");
} else {
    if (errors   > 0) { console.error(errors   + " error(s) found."); }
    if (warnings > 0) { console.warn(warnings  + " warning(s) found."); }
    if (errors   > 0) { process.exit(1); }
}
