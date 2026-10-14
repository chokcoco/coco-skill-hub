#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { analyzeCourse } from "./lib/course-structure-contract.mjs";

const TOOL_NAME = "teach-generator/validate-course";
const SCHEMA_VERSION = "1.0";
const DEFAULT_CONFIG = {
  requiredPaths: [
    "workspace/MISSION.md",
    "workspace/RESOURCES.md",
    "workspace/COURSE-GENERATION-SPEC.md",
    "workspace/COURSE-BLUEPRINT.md",
    "workspace/NOTES.md",
    "lessons",
  ],
  contentRoots: ["index.html", "course.json", "lessons", "reference", "markdown", "assets"],
  forbiddenMermaidTypes: ["mindmap"],
  allowedExternalUrlPrefixes: [],
  unregisteredExternalUrlSeverity: "warning",
};
const EXCLUDED_DIRECTORIES = new Set([".git", "node_modules", "quality"]);
const TEXT_EXTENSIONS = new Set([".md", ".html", ".htm", ".css", ".json"]);
const LINK_EXTENSIONS = new Set([".md", ".html", ".htm", ".css"]);

function toPosix(value) {
  return value.split(sep).join("/");
}

function lineNumberAt(text, index) {
  return text.slice(0, index).split("\n").length;
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function walkFiles(root) {
  if (!existsSync(root)) return [];
  if (!statSync(root).isDirectory()) return [root];
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) continue;
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function findRepositoryRoot(start) {
  let current = resolve(start);
  while (true) {
    if (existsSync(join(current, ".git"))) return current;
    const parent = dirname(current);
    if (parent === current) return resolve(start);
    current = parent;
  }
}

function loadConfig(courseRoot, explicitConfigPath) {
  const automaticPath = join(courseRoot, ".teach-generator-qc.json");
  const configPath = explicitConfigPath
    ? resolve(explicitConfigPath)
    : existsSync(automaticPath)
      ? automaticPath
      : null;
  if (!configPath) return { config: { ...DEFAULT_CONFIG }, configPath: null };

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (error) {
    throw new Error("无法读取质检配置 " + configPath + ": " + error.message);
  }
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("质检配置必须是 JSON 对象: " + configPath);
  }

  const config = { ...DEFAULT_CONFIG, ...parsed };
  for (const key of [
    "requiredPaths",
    "contentRoots",
    "forbiddenMermaidTypes",
    "allowedExternalUrlPrefixes",
  ]) {
    if (!Array.isArray(config[key]) || config[key].some((value) => typeof value !== "string")) {
      throw new Error("质检配置字段 " + key + " 必须是字符串数组");
    }
  }
  if (!["warning", "error", "off"].includes(config.unregisteredExternalUrlSeverity)) {
    throw new Error("unregisteredExternalUrlSeverity 只能是 warning、error 或 off");
  }
  return { config, configPath };
}

function stripCodeForProseChecks(text) {
  const withoutFences = text.replace(
    /(^|\n)[ \t]*(?:\x60{3,}|~{3,})[^\n]*\n[\s\S]*?(?:\n[ \t]*(?:\x60{3,}|~{3,})(?=\n|$)|$)/g,
    (match) => match.replace(/[^\n]/g, " "),
  );
  return withoutFences
    .replace(/<!--[\s\S]*?-->/g, (match) => match.replace(/[^\n]/g, " "))
    .replace(/\x60[^\x60\n]*\x60/g, (match) => " ".repeat(match.length));
}

function stripHtmlCodeForProseChecks(text) {
  return text.replace(
    /<(pre|code|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,
    (match) => match.replace(/[^\n]/g, " "),
  );
}

function fileIgnoresRule(text, ruleId) {
  return new RegExp("qc-ignore\\s+(?:\\*|" + ruleId + ")", "i").test(text);
}

function collectMarkdownAnchors(text) {
  const anchors = new Set();
  const occurrences = new Map();
  for (const match of text.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const plain = match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/[\x60*_~[\]]/g, "")
      .trim()
      .toLowerCase();
    const base = plain
      .replace(/[^\p{L}\p{N}\-_ ]/gu, "")
      .replace(/\s+/g, "-");
    if (!base) continue;
    const count = occurrences.get(base) || 0;
    occurrences.set(base, count + 1);
    anchors.add(count === 0 ? base : base + "-" + count);
  }
  for (const match of text.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)["']/gi)) {
    anchors.add(match[1]);
  }
  return anchors;
}

function collectHtmlAnchors(text) {
  const anchors = new Set();
  for (const match of text.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)["']/gi)) {
    anchors.add(match[1]);
  }
  return anchors;
}

function extractLinks(text, extension) {
  const links = [];
  if (extension === ".html" || extension === ".htm") {
    for (const match of text.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)) {
      links.push({ target: match[2], index: match.index });
    }
  }
  if (extension === ".md") {
    const prose = stripCodeForProseChecks(text);
    for (const match of prose.matchAll(/!?\[[^\]]*]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g)) {
      links.push({ target: match[1] || match[2], index: match.index });
    }
  }
  if (extension === ".css") {
    for (const match of text.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
      links.push({ target: match[2], index: match.index });
    }
  }
  return links;
}

function splitLinkTarget(rawTarget) {
  const target = rawTarget.trim();
  const hashIndex = target.indexOf("#");
  const pathAndQuery = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
  const fragment = hashIndex >= 0 ? safeDecode(target.slice(hashIndex + 1)) : "";
  const queryIndex = pathAndQuery.indexOf("?");
  const pathPart = queryIndex >= 0 ? pathAndQuery.slice(0, queryIndex) : pathAndQuery;
  return { pathPart: safeDecode(pathPart), fragment };
}

function isRemoteUrl(target) {
  return /^https?:\/\//i.test(target);
}

function shouldSkipLink(target) {
  return (
    !target ||
    /^(?:mailto:|tel:|data:|javascript:)/i.test(target) ||
    target.includes("$" + "{") ||
    target.includes("{{")
  );
}

function extractRemoteUrls(text) {
  const prose = stripCodeForProseChecks(text);
  return new Set(
    [...prose.matchAll(/https?:\/\/[^\s<>"')\]]+/g)].map((match) =>
      match[0].replace(/[.,;:!?，。；：！？]+$/u, ""),
    ),
  );
}

function normalizeRemoteUrl(url) {
  return url.replace(/[#?].*$/, "").replace(/\/+$/, "");
}

function formatIssue(issue) {
  const location = issue.file ? issue.file + (issue.line ? ":" + issue.line : "") : "(course)";
  return "[" + issue.severity.toUpperCase() + "] " + issue.ruleId + " " + location + " " + issue.message;
}

function markdownReport(report) {
  const lines = [
    "# 第一阶段确定性质检报告",
    "",
    "- 结果：" + (report.passed ? "通过" : "未通过"),
    "- 决策：" + report.decision,
    "- 内容哈希：" + report.contentHash,
    "- 检查文件：" + report.checkedFiles,
    "- 错误：" + report.counts.error,
    "- 警告：" + report.counts.warning,
    "",
    "## 问题",
    "",
  ];
  if (report.issues.length === 0) {
    lines.push("未发现问题。");
  } else {
    lines.push("| 严重级别 | 规则 | 文件 | 行 | 说明 |");
    lines.push("| --- | --- | --- | ---: | --- |");
    for (const issue of report.issues) {
      const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
      lines.push(
        "| " +
          escapeCell(issue.severity) +
          " | " +
          escapeCell(issue.ruleId) +
          " | " +
          escapeCell(issue.file || "") +
          " | " +
          escapeCell(issue.line || "") +
          " | " +
          escapeCell(issue.message) +
          " |",
      );
    }
  }
  lines.push("", "## 本阶段未覆盖", "");
  for (const item of report.limitations) lines.push("- " + item);
  lines.push("");
  return lines.join("\n");
}

export function runValidation(courseRootInput, options = {}) {
  const courseRoot = resolve(courseRootInput);
  if (!existsSync(courseRoot) || !statSync(courseRoot).isDirectory()) {
    throw new Error("课程目录不存在或不是目录: " + courseRoot);
  }

  const repositoryRoot = findRepositoryRoot(courseRoot);
  const { config, configPath } = loadConfig(courseRoot, options.configPath);
  const issues = [];
  const textCache = new Map();
  const anchorCache = new Map();

  const readText = (filePath) => {
    if (!textCache.has(filePath)) textCache.set(filePath, readFileSync(filePath, "utf8"));
    return textCache.get(filePath);
  };
  const relativeFile = (filePath) => toPosix(relative(courseRoot, filePath));
  const addIssue = (ruleId, severity, message, filePath = null, index = null, details = null) => {
    const text = filePath && existsSync(filePath) ? readText(filePath) : "";
    if (filePath && fileIgnoresRule(text, ruleId)) return;
    issues.push({
      ruleId,
      severity,
      message,
      file: filePath ? relativeFile(filePath) : null,
      line: filePath && index !== null ? lineNumberAt(text, index) : null,
      ...(details ? { details } : {}),
    });
  };

  for (const requiredPath of config.requiredPaths) {
    const fullPath = resolve(courseRoot, requiredPath);
    if (!existsSync(fullPath)) {
      addIssue("STRUCTURE_REQUIRED_PATH", "error", "缺少必需路径: " + requiredPath);
    }
  }

  const contentFiles = new Set();
  const includePaths = Array.isArray(options.includePaths) ? options.includePaths : [];
  if (includePaths.length > 0) {
    for (const includePath of includePaths) {
      const filePath = resolve(courseRoot, includePath);
      if (!filePath.startsWith(courseRoot + sep) || !existsSync(filePath)) {
        addIssue("SCOPE_INCLUDE_MISSING", "error", "批次质检文件不存在: " + includePath);
      } else if (TEXT_EXTENSIONS.has(extname(filePath).toLowerCase())) {
        contentFiles.add(filePath);
      }
    }
  } else {
    for (const contentRoot of config.contentRoots) {
      const fullPath = resolve(courseRoot, contentRoot);
      for (const filePath of walkFiles(fullPath)) {
        if (TEXT_EXTENSIONS.has(extname(filePath).toLowerCase())) contentFiles.add(filePath);
      }
    }
  }
  if (contentFiles.size === 0) addIssue("STRUCTURE_NO_CONTENT", "error", "没有找到可质检的课程内容");

  const sortedContentFiles = [...contentFiles].sort();
  const includedLessonPaths = sortedContentFiles
    .filter((filePath) => extname(filePath).toLowerCase() === ".md" && relativeFile(filePath).startsWith("lessons/"))
    .map(relativeFile);
  const contractReport = analyzeCourse(courseRoot, includedLessonPaths);
  for (const diagnostic of contractReport.diagnostics) {
    const filePath = resolve(courseRoot, diagnostic.path);
    addIssue(
      diagnostic.code,
      diagnostic.severity,
      `${diagnostic.actual || "当前结构"}；期望：${diagnostic.expected}`,
      filePath,
      0,
      { contract: diagnostic },
    );
  }
  const registeredRemoteUrls = new Set(config.allowedExternalUrlPrefixes.map(normalizeRemoteUrl));
  const resourcesPath = join(courseRoot, "workspace", "RESOURCES.md");
  if (existsSync(resourcesPath)) {
    for (const url of extractRemoteUrls(readText(resourcesPath))) {
      registeredRemoteUrls.add(normalizeRemoteUrl(url));
    }
  }

  const courseJsonPath = join(courseRoot, "course.json");
  if (includePaths.length === 0 && existsSync(courseJsonPath)) {
    let course;
    try {
      course = JSON.parse(readText(courseJsonPath));
    } catch (error) {
      addIssue("METADATA_INVALID_JSON", "error", "course.json 不是有效 JSON: " + error.message, courseJsonPath, 0);
    }
    if (course) {
      if (!Array.isArray(course.lessons)) {
        addIssue("METADATA_LESSONS_MISSING", "error", "course.json 缺少 lessons 数组", courseJsonPath, 0);
      } else {
        const seenNumbers = new Set();
        const seenHrefs = new Set();
        for (const lesson of course.lessons) {
          if (lesson.number !== undefined) {
            if (seenNumbers.has(lesson.number)) {
              addIssue("METADATA_DUPLICATE_LESSON", "error", "course.json 存在重复章节编号: " + lesson.number, courseJsonPath, 0);
            }
            seenNumbers.add(lesson.number);
          }
          for (const key of ["href", "markdown"]) {
            if (!lesson[key]) continue;
            const target = resolve(courseRoot, lesson[key]);
            if (!existsSync(target)) {
              addIssue("METADATA_TARGET_MISSING", "error", "course.json 中的 " + key + " 不存在: " + lesson[key], courseJsonPath, 0);
            }
            if (key === "href") {
              if (seenHrefs.has(lesson.href)) {
                addIssue("METADATA_DUPLICATE_LESSON", "error", "course.json 存在重复 href: " + lesson.href, courseJsonPath, 0);
              }
              seenHrefs.add(lesson.href);
            }
          }
          if (Array.isArray(lesson.sources)) {
            for (const source of lesson.sources) {
              if (source?.url) registeredRemoteUrls.add(normalizeRemoteUrl(source.url));
            }
          }
        }
      }
    }
  }

  const anchorSetFor = (filePath) => {
    if (anchorCache.has(filePath)) return anchorCache.get(filePath);
    const extension = extname(filePath).toLowerCase();
    const text = readText(filePath);
    const anchors = extension === ".md" ? collectMarkdownAnchors(text) : collectHtmlAnchors(text);
    anchorCache.set(filePath, anchors);
    return anchors;
  };

  for (const filePath of sortedContentFiles) {
    const extension = extname(filePath).toLowerCase();
    const text = readText(filePath);
    const proseSource =
      extension === ".html" || extension === ".htm"
        ? stripHtmlCodeForProseChecks(text)
        : text;
    const prose = stripCodeForProseChecks(proseSource);

    if (extension === ".md") {
      let openFence = null;
      let openIndex = null;
      let offset = 0;
      for (const line of text.split("\n")) {
        const match = line.match(/^[ \t]*(\x60{3,}|~{3,})/);
        if (match) {
          const marker = match[1];
          if (!openFence) {
            openFence = marker;
            openIndex = offset;
          } else if (marker[0] === openFence[0] && marker.length >= openFence.length) {
            openFence = null;
            openIndex = null;
          }
        }
        offset += line.length + 1;
      }
      if (openFence) addIssue("MARKDOWN_UNCLOSED_FENCE", "error", "Markdown 代码围栏未闭合", filePath, openIndex);
    }

    if (extension === ".html" || extension === ".htm") {
      for (const tag of ["html", "head", "body"]) {
        if (!new RegExp("<" + tag + "\\b", "i").test(text) || !new RegExp("</" + tag + ">", "i").test(text)) {
          addIssue("HTML_REQUIRED_ELEMENT", "error", "HTML 缺少完整的 <" + tag + "> 元素", filePath, 0);
        }
      }
      if (!/<!doctype\s+html>/i.test(text)) addIssue("HTML_DOCTYPE", "warning", "HTML 缺少 <!doctype html>", filePath, 0);
      if (!/<html\b[^>]*\blang\s*=/i.test(text)) addIssue("HTML_LANG", "warning", "HTML 根元素缺少 lang 属性", filePath, 0);
      const seenIds = new Map();
      for (const match of text.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
        if (seenIds.has(match[1])) {
          addIssue("HTML_DUPLICATE_ID", "error", "HTML 存在重复 id: " + match[1], filePath, match.index);
        } else {
          seenIds.set(match[1], match.index);
        }
      }
    }

    for (const placeholder of [
      { regex: /\b(?:TODO|TBD|FIXME|PLACEHOLDER)\b/gi, label: "英文占位符" },
      { regex: /(?:待补充|待完善|稍后补充|此处插入)/g, label: "中文占位符" },
      { regex: /lorem\s+ipsum/gi, label: "Lorem Ipsum" },
    ]) {
      const match = placeholder.regex.exec(prose);
      if (match) {
        addIssue("CONTENT_PLACEHOLDER", "error", "学生内容中残留" + placeholder.label + ": " + match[0], filePath, match.index);
      }
    }

    const internalMatch = /\b(?:source_item_ids?|generation_job_id|ref_id|item_id|follow_up_questions)\b|QA\s*来源清单/gi.exec(prose);
    if (internalMatch) {
      addIssue("CONTENT_INTERNAL_FIELD", "error", "学生内容暴露内部字段: " + internalMatch[0], filePath, internalMatch.index);
    }
    // A user-facing API route such as \`/api/v1/users/</code>\` must never be
    // mistaken for a macOS home path. Require a plausible account-directory
    // segment after \`/Users/\` or \`/home/\`, then a separator or end of string.
    const privatePathMatch = /(?<![A-Za-z0-9._-])(?:\/Users\/[A-Za-z0-9._-]+(?:\/|$)|\/home\/[A-Za-z0-9._-]+(?:\/|$)|[A-Z]:\\Users\\[A-Za-z0-9._-]+(?:\\|$))/.exec(prose);
    if (privatePathMatch) {
      addIssue("CONTENT_PRIVATE_PATH", "error", "学生内容暴露本机私有路径", filePath, privatePathMatch.index);
    }

    if (extension === ".md") {
      for (const match of text.matchAll(/^[ \t]*\x60{3,}mermaid[^\n]*\n([\s\S]*?)^[ \t]*\x60{3,}[ \t]*$/gmi)) {
        const firstLine = match[1].split("\n").find((line) => line.trim())?.trim() || "";
        const diagramType = firstLine.split(/\s+/)[0].toLowerCase();
        if (!diagramType) {
          addIssue("MERMAID_MISSING_TYPE", "error", "Mermaid 图缺少图类型声明", filePath, match.index);
        } else if (config.forbiddenMermaidTypes.map((value) => value.toLowerCase()).includes(diagramType)) {
          addIssue("MERMAID_FORBIDDEN_TYPE", "error", "使用了禁止的 Mermaid 图类型: " + diagramType, filePath, match.index);
        }
      }
    }

    if (LINK_EXTENSIONS.has(extension)) {
      for (const link of extractLinks(text, extension)) {
        const target = link.target.trim();
        if (shouldSkipLink(target)) continue;
        if (isRemoteUrl(target)) {
          if (config.unregisteredExternalUrlSeverity !== "off") {
            const normalized = normalizeRemoteUrl(target);
            const registered = [...registeredRemoteUrls].some(
              (allowed) => normalized === allowed || normalized.startsWith(allowed + "/"),
            );
            if (!registered) {
              addIssue(
                "URL_NOT_IN_RESOURCES",
                config.unregisteredExternalUrlSeverity,
                "外部 URL 未登记到 RESOURCES.md、course.json 或配置白名单: " + target,
                filePath,
                link.index,
              );
            }
          }
          continue;
        }

        const { pathPart, fragment } = splitLinkTarget(target);
        let targetPath = pathPart
          ? pathPart.startsWith("/")
            ? resolve(repositoryRoot, "." + pathPart)
            : resolve(dirname(filePath), pathPart)
          : filePath;
        if (existsSync(targetPath) && statSync(targetPath).isDirectory()) targetPath = join(targetPath, "index.html");
        if (!existsSync(targetPath)) {
          addIssue("LINK_TARGET_MISSING", "error", "本地链接目标不存在: " + target, filePath, link.index);
          continue;
        }
        if (fragment && LINK_EXTENSIONS.has(extname(targetPath).toLowerCase())) {
          if (!anchorSetFor(targetPath).has(fragment)) {
            addIssue("LINK_ANCHOR_MISSING", "error", "链接锚点不存在: #" + fragment, filePath, link.index);
          }
        }
      }
    }
  }

  const hashFiles = new Set(sortedContentFiles);
  for (const requiredPath of config.requiredPaths) {
    const fullPath = resolve(courseRoot, requiredPath);
    if (existsSync(fullPath) && statSync(fullPath).isFile()) hashFiles.add(fullPath);
  }
  if (configPath && existsSync(configPath)) hashFiles.add(configPath);

  const hash = createHash("sha256");
  for (const filePath of [...hashFiles].sort()) {
    hash.update(relativeFile(filePath));
    hash.update("\0");
    hash.update(readText(filePath));
    hash.update("\0");
  }
  const counts = {
    error: issues.filter((issue) => issue.severity === "error").length,
    warning: issues.filter((issue) => issue.severity === "warning").length,
  };
  const report = {
    schemaVersion: SCHEMA_VERSION,
    tool: TOOL_NAME,
    generatedAt: new Date().toISOString(),
    courseRoot,
    repositoryRoot,
    configPath,
    contentHash: hash.digest("hex"),
    passed: counts.error === 0,
    decision: counts.error > 0 ? "reject" : counts.warning > 0 ? "phase1_passed_with_warnings" : "phase1_passed",
    counts,
    checkedFiles: sortedContentFiles.length,
    hashedFiles: hashFiles.size,
    issues,
    limitations: [
      "不访问网络，因此不判断外部 URL 当前是否可达。",
      "不安装 Mermaid 或 HTML 解析器，因此只检查可稳定判定的结构和禁用图类型，不保证完整语法正确。",
      "不执行课程中的任意代码命令；声称可运行的示例仍需单独运行或测试。",
      "不判断事实是否被来源真正支持、内容是否讲透或语言是否自然；这些项目进入第二阶段评价量规。",
    ],
  };

  if (options.writeReports !== false) {
    const outputDirectory = resolve(options.outputDirectory || join(courseRoot, "quality"));
    mkdirSync(outputDirectory, { recursive: true });
    writeFileSync(join(outputDirectory, "phase-1-deterministic.json"), JSON.stringify(report, null, 2) + "\n");
    writeFileSync(join(outputDirectory, "phase-1-deterministic.md"), markdownReport(report));
  }
  return report;
}

function parseArguments(argv) {
  const options = { writeReports: true, includePaths: [] };
  let courseRoot = null;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") return { help: true };
    if (argument === "--no-write") {
      options.writeReports = false;
      continue;
    }
    if (argument === "--output-dir") {
      options.outputDirectory = argv[++index];
      if (!options.outputDirectory) throw new Error("--output-dir 缺少路径");
      continue;
    }
    if (argument === "--config") {
      options.configPath = argv[++index];
      if (!options.configPath) throw new Error("--config 缺少路径");
      continue;
    }
    if (argument === "--include") {
      const includePath = argv[++index];
      if (!includePath) throw new Error("--include 缺少课程内文件路径");
      options.includePaths.push(includePath);
      continue;
    }
    if (argument.startsWith("-")) throw new Error("未知参数: " + argument);
    if (courseRoot) throw new Error("只能提供一个课程目录");
    courseRoot = argument;
  }
  if (!courseRoot) throw new Error("缺少课程目录");
  return { courseRoot, options, help: false };
}

function printHelp() {
  console.log(
    [
      "用法:",
      "  node validate-course.mjs <course-root> [--config <file>] [--output-dir <dir>] [--include <course-file>] [--no-write]",
      "",
      "默认读取 <course-root>/.teach-generator-qc.json（如果存在），",
      "并写入 quality/phase-1-deterministic.json 与 quality/phase-1-deterministic.md。",
      "传入一个或多个 --include 时，只检查指定的课程内文件，适用于独立批次门禁。",
      "存在 error 时退出码为 1；只有 warning 时仍通过第一阶段。",
      "",
      "文件可用 HTML 注释 qc-ignore RULE_ID 忽略一条明确规则；",
      "使用 qc-ignore * 可忽略该文件的所有规则。忽略项必须经过人工审核。",
    ].join("\n"),
  );
}

async function main() {
  try {
    const parsed = parseArguments(process.argv.slice(2));
    if (parsed.help) {
      printHelp();
      return;
    }
    const report = runValidation(parsed.courseRoot, parsed.options);
    for (const issue of report.issues) console.log(formatIssue(issue));
    console.log(
      "第一阶段质检" +
        (report.passed ? "通过" : "未通过") +
        ": " +
        report.counts.error +
        " error, " +
        report.counts.warning +
        " warning",
    );
    process.exitCode = report.passed ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) await main();
