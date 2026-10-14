import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { runValidation } from "./validate-course.mjs";

function write(root, path, content) {
  const fullPath = join(root, path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content);
}

function createCourse() {
  const root = mkdtempSync(join(tmpdir(), "teach-generator-qc-"));
  for (const file of [
    "MISSION.md",
    "COURSE-GENERATION-SPEC.md",
    "COURSE-BLUEPRINT.md",
    "NOTES.md",
  ]) {
    write(root, "workspace/" + file, "# " + file + "\n");
  }
  write(root, "workspace/RESOURCES.md", "# Resources\n\n- https://example.com/docs\n");
  write(
    root,
    "index.html",
    '<!doctype html><html lang="zh-CN"><head><title>课程</title></head><body><a href="lessons/0001.html#intro">第一章</a></body></html>',
  );
  write(
    root,
    "lessons/0001.html",
    '<!doctype html><html lang="zh-CN"><head><title>第一章</title></head><body><h1 id="intro">开始</h1><a href="https://example.com/docs">资料</a></body></html>',
  );
  write(root, "markdown/course.md", "# 课程\n\n[第一章](../lessons/0001.html#intro)\n");
  write(
    root,
    "course.json",
    JSON.stringify({
      lessons: [
        {
          number: 1,
          href: "lessons/0001.html",
          markdown: "markdown/course.md",
          sources: [{ url: "https://example.com/docs" }],
        },
      ],
    }),
  );
  return root;
}

test("valid course passes deterministic checks", () => {
  const root = createCourse();
  try {
    const report = runValidation(root, { writeReports: false });
    assert.equal(report.passed, true);
    assert.equal(report.counts.error, 0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("hard failures are reported with stable rule ids", () => {
  const root = createCourse();
  const fence = String.fromCharCode(96).repeat(3);
  try {
    write(
      root,
      "markdown/course.md",
      [
        "# 课程",
        "",
        "TODO：补完 ref_id。",
        "",
        "[坏链接](./missing.md)",
        "",
        fence + "mermaid",
        "mindmap",
        "  root((课程))",
        fence,
        "",
        fence + "js",
        "const value = 1;",
      ].join("\n"),
    );
    const report = runValidation(root, { writeReports: false });
    const ruleIds = new Set(report.issues.map((issue) => issue.ruleId));
    assert.equal(report.passed, false);
    assert.ok(ruleIds.has("CONTENT_PLACEHOLDER"));
    assert.ok(ruleIds.has("CONTENT_INTERNAL_FIELD"));
    assert.ok(ruleIds.has("LINK_TARGET_MISSING"));
    assert.ok(ruleIds.has("MERMAID_FORBIDDEN_TYPE"));
    assert.ok(ruleIds.has("MARKDOWN_UNCLOSED_FENCE"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("reports are written to the quality directory", () => {
  const root = createCourse();
  try {
    const report = runValidation(root);
    assert.equal(report.passed, true);
    assert.equal(report.checkedFiles, 4);
    assert.equal(existsSync(join(root, "quality/phase-1-deterministic.json")), true);
    assert.equal(existsSync(join(root, "quality/phase-1-deterministic.md")), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("content hash changes when the course mission changes", () => {
  const root = createCourse();
  try {
    const before = runValidation(root, { writeReports: false });
    write(root, "workspace/MISSION.md", "# Mission\n\n新的学习目标。\n");
    const after = runValidation(root, { writeReports: false });
    assert.notEqual(before.contentHash, after.contentHash);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("lesson structure contract is self-contained", () => {
  const root = createCourse();
  try {
    write(root, "lessons/0001.md", "# 第一章\n\n正文。\n");
    const report = runValidation(root, {
      includePaths: ["lessons/0001.md"],
      writeReports: false,
    });
    const ruleIds = new Set(report.issues.map((issue) => issue.ruleId));
    assert.ok(ruleIds.has("INTRO_NON_CANONICAL"));
    assert.ok(ruleIds.has("REFERENCE_SECTION_MISSING"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
