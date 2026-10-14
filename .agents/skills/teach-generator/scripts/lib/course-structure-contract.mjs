import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const REFERENCE_TITLE = "参考文献";

function toPosix(value) {
  return value.replaceAll("\\", "/");
}

function maskCodeFences(markdown) {
  return markdown.replace(
    /(^|\n)[ \t]*(?:\x60{3,}|~{3,})[^\n]*\n[\s\S]*?(?:\n[ \t]*(?:\x60{3,}|~{3,})(?=\n|$)|$)/g,
    (match) => match.replace(/[^\n]/g, " "),
  );
}

function lineAt(markdown, offset) {
  return markdown.slice(0, offset).split("\n").length;
}

function headingMatches(markdown, depth) {
  const visible = maskCodeFences(markdown);
  const marker = "#".repeat(depth);
  const expression = new RegExp("^" + marker + "(?!#)\\s+(.+?)\\s*#*\\s*$", "gm");
  return [...visible.matchAll(expression)].map((match) => ({
    title: match[1].trim(),
    offset: match.index,
    line: lineAt(markdown, match.index),
  }));
}

function canonicalIntro(markdown, title) {
  if (!title) return null;
  const afterTitle = markdown.slice(title.offset).replace(/^#[^\n]*(?:\n|$)/, "");
  const lines = afterTitle.split(/\r?\n/);
  while (lines.length && !lines[0].trim()) lines.shift();
  const quoteLines = [];
  while (lines.length && /^\s*>/.test(lines[0])) {
    quoteLines.push(lines.shift().replace(/^\s*>\s?/, "").trim());
  }
  if (
    quoteLines.length !== 2
    || !quoteLines[0].startsWith("预计学习时间：")
    || !quoteLines[1].startsWith("一句话总结：")
  ) return null;
  return { time: quoteLines[0], summary: quoteLines[1] };
}

function analyzeLesson(markdown, path) {
  const diagnostics = [];
  const titles = headingMatches(markdown, 1);
  const title = titles[0] || null;
  const intro = canonicalIntro(markdown, title);
  const sections = headingMatches(markdown, 2);
  const reference = sections.find((heading) => heading.title === REFERENCE_TITLE) || null;

  if (!title) {
    diagnostics.push({
      code: "TITLE_MISSING",
      path,
      line: 1,
      actual: "未找到一级标题",
      expected: "一个一级标题",
      severity: "error",
    });
  } else if (titles.length > 1) {
    diagnostics.push({
      code: "TITLE_DUPLICATE",
      path,
      line: titles[1].line,
      actual: `${titles.length} 个一级标题`,
      expected: "仅一个一级标题",
      severity: "error",
    });
  }

  if (!intro) {
    diagnostics.push({
      code: "INTRO_NON_CANONICAL",
      path,
      line: title?.line || 1,
      actual: "章首未形成标准引用块",
      expected: "一级标题后紧跟仅含预计学习时间和一句话总结的两行引用块",
      severity: "error",
    });
  }

  if (!reference) {
    diagnostics.push({
      code: "REFERENCE_SECTION_MISSING",
      path,
      line: sections.at(-1)?.line || title?.line || 1,
      actual: sections.map((heading) => heading.title).join(" / ") || "未找到二级标题",
      expected: `## ${REFERENCE_TITLE}`,
      severity: "error",
    });
  } else {
    const beforeReferences = maskCodeFences(markdown.slice(0, reference.offset));
    const externalLink = /https?:\/\/[^\s<>)\]]+/i.exec(beforeReferences);
    if (externalLink) {
      diagnostics.push({
        code: "EXTERNAL_LINK_BEFORE_REFERENCES",
        path,
        line: lineAt(markdown, externalLink.index),
        actual: "外部链接位于参考文献区块之前",
        expected: "学生可见外部链接统一位于参考文献区块",
        severity: "error",
      });
    }
  }

  return { path, diagnostics };
}

export function analyzeCourse(courseRoot, lessonPaths = null) {
  let paths = lessonPaths;
  if (!paths) {
    const descriptorPath = join(courseRoot, "course.json");
    if (existsSync(descriptorPath)) {
      const course = JSON.parse(readFileSync(descriptorPath, "utf8"));
      paths = (course.lessons || []).map((lesson) => lesson.markdown).filter(Boolean);
    } else {
      const lessonsRoot = join(courseRoot, "lessons");
      paths = existsSync(lessonsRoot)
        ? readdirSync(lessonsRoot)
          .filter((name) => name.endsWith(".md"))
          .map((name) => `lessons/${name}`)
        : [];
    }
  }

  const lessons = [];
  const diagnostics = [];
  for (const path of [...new Set(paths)].sort()) {
    const absolute = join(courseRoot, path);
    if (!existsSync(absolute)) continue;
    const report = analyzeLesson(
      readFileSync(absolute, "utf8"),
      toPosix(relative(courseRoot, absolute)),
    );
    lessons.push(report);
    diagnostics.push(...report.diagnostics);
  }
  return { schemaVersion: "1.0", courseRoot, lessons, diagnostics };
}
