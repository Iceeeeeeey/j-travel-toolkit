#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { unzipSync, strFromU8 } from "fflate";
import { DOMParser } from "@xmldom/xmldom";

const __filename = fileURLToPath(import.meta.url);
const skillDir = path.resolve(path.dirname(__filename), "..");
const templateDir = path.join(skillDir, "assets", "app-template");

const args = process.argv.slice(2);
const command = args[0];
const options = parseOptions(args.slice(1));

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});

async function main() {
  if (command === "create") {
    const excelPath = requiredOption("excel");
    const outDir = path.resolve(requiredOption("out"));
    const workbook = await readWorkbook(excelPath);
    const data = parseWorkbook(workbook, excelPath);
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
    fs.cpSync(templateDir, outDir, { recursive: true });
    writeGeneratedSite(outDir, data);
    console.log(JSON.stringify({ outDir, title: data.title, days: data.days.length }, null, 2));
    return;
  }

  if (command === "publish") {
    const siteDir = path.resolve(requiredOption("site"));
    publish(siteDir, options);
    return;
  }

  usage();
}

function parseOptions(items) {
  const parsed = {};
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = items[i + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function requiredOption(name) {
  const value = options[name];
  if (!value || value === true) {
    throw new Error(`Missing required option --${name}`);
  }
  return value;
}

function usage() {
  console.log(`J人旅行神器

Usage:
  j-travel-toolkit create --excel trip.xlsx --out ./my-trip-site
  j-travel-toolkit publish --site ./my-trip-site
  j-travel-toolkit publish --site ./my-trip-site --repo-url https://github.com/user/repo.git
`);
}

function parseWorkbook(workbook, excelPath) {
  const info = parseInfo(workbook);
  const days = parseItinerary(workbook);
  const hotels = parseHotels(workbook);
  mergeHotels(days, hotels);
  const transport = parseTransport(workbook, days);
  const tips = parseTips(workbook);
  const packing = parsePacking(workbook);
  const links = parseLinks(workbook);
  const title = info["旅行名称"] || info["标题"] || inferTitle(excelPath, days);
  const subtitle = info["副标题"] || "每天一页，一眼知道今天要干啥";
  const id = slugify(title || "j-travel");

  return {
    id,
    title,
    subtitle,
    days,
    transport,
    tips: tips.length ? tips : defaultTips(),
    packing: packing.length ? packing : defaultPacking(),
    links,
  };
}

async function readWorkbook(excelPath) {
  const zip = unzipSync(fs.readFileSync(excelPath));
  const xml = (name) => {
    const entry = zip[name];
    return entry ? strFromU8(entry) : "";
  };
  const workbookDoc = parseXml(xml("xl/workbook.xml"));
  const rels = parseRelationships(xml("xl/_rels/workbook.xml.rels"));
  const sharedStrings = parseSharedStrings(xml("xl/sharedStrings.xml"));
  const sheets = elements(workbookDoc, "sheet").map((sheet, index) => {
    const name = sheet.getAttribute("name") || `Sheet${index + 1}`;
    const relId = sheet.getAttribute("r:id");
    const target = rels[relId] || `worksheets/sheet${index + 1}.xml`;
    const normalized = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^xl\//, "")}`;
    return { name, path: normalized };
  });
  const workbook = {};
  for (const sheet of sheets) {
    workbook[sheet.name] = rowsToObjects(parseSheetRows(xml(sheet.path), sharedStrings));
  }
  return workbook;
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const knownHeaders = new Set(["日期", "星期", "城市", "时间", "行程", "项目", "内容", "分类", "物品", "名称", "用途", "链接", "类型", "编号", "出发", "到达", "酒店", "晚数"]);
  const headerIndex = rows.findIndex((row) => row.filter((cell) => knownHeaders.has(clean(cell))).length >= 2);
  if (headerIndex === -1) return [];
  const headers = rows[headerIndex].map((cell) => clean(cell));
  return rows.slice(headerIndex + 1).map((row) => {
    const object = {};
    headers.forEach((header, index) => {
      if (!header) return;
      object[header] = formatCell(row[index]);
    });
    return object;
  }).filter((row) => Object.values(row).some((value) => clean(value)));
}

function formatCell(value) {
  return value ?? "";
}

function parseXml(text) {
  return new DOMParser().parseFromString(text || "<root/>", "application/xml");
}

function parseRelationships(text) {
  const doc = parseXml(text);
  const rels = {};
  for (const rel of elements(doc, "Relationship")) {
    rels[rel.getAttribute("Id")] = rel.getAttribute("Target");
  }
  return rels;
}

function parseSharedStrings(text) {
  if (!text) return [];
  const doc = parseXml(text);
  return elements(doc, "si").map((si) => (
    elements(si, "t").map((t) => t.textContent || "").join("")
  ));
}

function parseSheetRows(text, sharedStrings) {
  if (!text) return [];
  const doc = parseXml(text);
  const rows = [];
  for (const row of elements(doc, "row")) {
    const cells = [];
    for (const cell of elements(row, "c")) {
      const ref = cell.getAttribute("r") || "";
      const colIndex = columnIndex(ref.replace(/\d+/g, ""));
      cells[colIndex] = parseCell(cell, sharedStrings);
    }
    rows.push(cells.map((value) => value ?? ""));
  }
  return rows;
}

function parseCell(cell, sharedStrings) {
  const inline = elements(cell, "is")[0];
  if (inline) {
    return elements(inline, "t").map((t) => t.textContent || "").join("");
  }
  const type = cell.getAttribute("t");
  const valueNode = elements(cell, "v")[0];
  const value = valueNode ? valueNode.textContent || "" : "";
  if (type === "s") return sharedStrings[Number(value)] || "";
  if (type === "inlineStr" || type === "str") return value;
  return value;
}

function columnIndex(column) {
  let index = 0;
  for (const char of column) {
    index = index * 26 + (char.charCodeAt(0) - 64);
  }
  return Math.max(index - 1, 0);
}

function elements(root, localName) {
  return Array.from(root.getElementsByTagName("*")).filter((node) => {
    const name = node.localName || node.nodeName.split(":").pop();
    return name === localName;
  });
}

function sheetRows(workbook, names) {
  const name = names.find((candidate) => Object.prototype.hasOwnProperty.call(workbook, candidate));
  if (!name) return [];
  return workbook[name];
}

function parseInfo(workbook) {
  const rows = sheetRows(workbook, ["信息", "Info", "配置"]);
  const info = {};
  for (const row of rows) {
    const key = clean(row["项目"] || row["key"] || row["Key"]);
    const value = clean(row["内容"] || row["value"] || row["Value"]);
    if (key) info[key] = value;
  }
  return info;
}

function parseItinerary(workbook) {
  const rows = sheetRows(workbook, ["行程", "Itinerary", "Sheet1"]);
  if (!rows.length) throw new Error("Excel must include a sheet named 行程 with 日期/时间/行程 columns.");

  const days = [];
  let current = { date: "", weekday: "", city: "" };
  let dayIndex = 0;
  let activityIndex = 0;

  for (const row of rows) {
    const date = clean(row["日期"] || row["Date"]);
    const weekday = clean(row["星期"] || row["Weekday"]);
    const city = clean(row["城市"] || row["City"]);
    const time = clean(row["时间"] || row["Time"]);
    const text = clean(row["行程"] || row["活动"] || row["Activity"] || row["Itinerary"]);

    if (date) current.date = date;
    if (weekday) current.weekday = weekday;
    if (city) current.city = city;
    if (!text && !time) continue;
    if (!current.date) current.date = `第${days.length + 1}天`;

    let day = days.find((candidate) => candidate.date === current.date);
    if (!day) {
      dayIndex += 1;
      day = {
        id: `day-${dayIndex}`,
        date: current.date,
        weekday: current.weekday,
        city: current.city,
        summary: "",
        activities: [],
      };
      days.push(day);
    } else {
      if (!day.weekday && current.weekday) day.weekday = current.weekday;
      if (!day.city && current.city) day.city = current.city;
    }

    const title = text || "待定";
    if (title === "-" && day.activities.length > 0) continue;
    activityIndex += 1;
    const parsed = splitActivity(title);
    day.activities.push({
      id: `a-${activityIndex}`,
      time,
      title: parsed.title,
      note: parsed.note,
    });
  }

  for (const day of days) {
    day.summary = summarizeDay(day);
  }

  return days;
}

function splitActivity(text) {
  const paren = text.match(/^(.*?)（(.+)）$/) || text.match(/^(.*?)\\((.+)\\)$/);
  if (paren) return { title: clean(paren[1]), note: clean(paren[2]) };
  return { title: text, note: "" };
}

function summarizeDay(day) {
  const firstTransport = day.activities.find((activity) => isTransportText(activity.title));
  if (firstTransport) return firstTransport.title;
  const first = day.activities[0];
  return first ? first.title : "";
}

function parseHotels(workbook) {
  return sheetRows(workbook, ["住宿", "Hotels"]).map((row, index) => ({
    id: `h-${index + 1}`,
    date: clean(row["日期"] || row["Date"]),
    city: clean(row["城市"] || row["City"]),
    name: clean(row["酒店"] || row["住宿"] || row["Hotel"]),
    nights: clean(row["晚数"] || row["Nights"]),
    address: clean(row["地址"] || row["Address"]),
    note: clean(row["备注"] || row["Note"]),
  })).filter((hotel) => hotel.name);
}

function mergeHotels(days, hotels) {
  for (const hotel of hotels) {
    const day = days.find((candidate) => candidate.date === hotel.date) || days.find((candidate) => candidate.city && candidate.city.includes(hotel.city));
    if (day) day.hotel = hotel;
  }

  for (const day of days) {
    if (day.hotel) continue;
    const hotelActivity = day.activities.find((activity) => /酒店|住宿|入住|放行李/.test(`${activity.title} ${activity.note || ""}`));
    if (hotelActivity) {
      day.hotel = {
        name: hotelActivity.note || hotelActivity.title,
        city: day.city,
        nights: "",
        note: "从行程中自动识别",
      };
    }
  }
}

function parseTransport(workbook, days) {
  const explicit = sheetRows(workbook, ["交通", "Transport"]).map((row, index) => {
    const depTime = clean(row["出发时间"] || row["Departure Time"]);
    const arrTime = clean(row["到达时间"] || row["Arrival Time"]);
    const time = depTime && arrTime ? `${depTime}-${arrTime}` : (depTime || arrTime || clean(row["时间"] || row["Time"]));
    const departure = clean(row["出发"] || row["Departure"]);
    const arrival = clean(row["到达"] || row["Arrival"]);
    const type = clean(row["类型"] || row["Type"]) || "交通";
    const code = clean(row["编号"] || row["Code"]);
    return {
      id: `t-${index + 1}`,
      date: clean(row["日期"] || row["Date"]),
      type,
      title: clean(row["标题"] || row["Title"]) || [departure, arrival].filter(Boolean).join(" → ") || type,
      code,
      departure,
      arrival,
      time,
      note: clean(row["备注"] || row["Note"]),
    };
  }).filter((item) => item.title);

  if (explicit.length) return explicit;

  const inferred = [];
  let index = 0;
  for (const day of days) {
    for (const activity of day.activities) {
      const text = `${activity.title} ${activity.note || ""}`;
      if (!isTransportText(text)) continue;
      index += 1;
      inferred.push({
        id: `t-${index}`,
        date: day.date,
        type: inferTransportType(text),
        title: activity.title,
        code: inferTransportCode(text),
        departure: inferDeparture(day.city, text),
        arrival: inferArrival(day.city, text),
        time: activity.time,
        note: activity.note || "",
      });
    }
  }
  return inferred;
}

function parseTips(workbook) {
  return sheetRows(workbook, ["贴士", "Tips"]).map((row, index) => ({
    id: `tip-${index + 1}`,
    category: clean(row["分类"] || row["Category"]) || "提醒",
    text: clean(row["内容"] || row["贴士"] || row["Tip"]),
  })).filter((tip) => tip.text);
}

function parsePacking(workbook) {
  return sheetRows(workbook, ["物品", "Packing"]).map((row, index) => ({
    id: `pack-${index + 1}`,
    category: clean(row["分类"] || row["Category"]) || "其他",
    name: clean(row["物品"] || row["Item"]),
    note: clean(row["备注"] || row["Note"]),
  })).filter((item) => item.name);
}

function parseLinks(workbook) {
  return sheetRows(workbook, ["快捷", "Links"]).map((row, index) => ({
    id: `link-${index + 1}`,
    category: clean(row["分类"] || row["Category"]) || "快捷入口",
    name: clean(row["名称"] || row["Name"]),
    purpose: clean(row["用途"] || row["Purpose"]),
    url: clean(row["链接"] || row["URL"] || row["Url"]),
  })).filter((link) => link.name);
}

function writeGeneratedSite(outDir, data) {
  fs.writeFileSync(path.join(outDir, "src", "trip-data.json"), `${JSON.stringify(data, null, 2)}\n`);
  const manifestPath = path.join(outDir, "public", "manifest.webmanifest");
  const manifest = fs.readFileSync(manifestPath, "utf8")
    .replaceAll("__APP_TITLE__", escapeJsonString(data.title))
    .replaceAll("__APP_SHORT_TITLE__", escapeJsonString(shortTitle(data.title)));
  fs.writeFileSync(manifestPath, manifest);
  fs.writeFileSync(path.join(outDir, "README.md"), generatedReadme(data));
}

function generatedReadme(data) {
  return `# ${data.title}

由 J人旅行神器生成。

## 本地预览

\`\`\`bash
npm install
npm run dev
\`\`\`

## 发布

\`\`\`bash
npm run build
npm run deploy
\`\`\`
`;
}

function publish(siteDir, publishOptions = {}) {
  if (!fs.existsSync(path.join(siteDir, "package.json"))) throw new Error(`Not a generated site directory: ${siteDir}`);
  ensureGitRepo(siteDir, publishOptions["repo-url"]);
  run("npm", ["install"], siteDir);
  run("npm", ["run", "build"], siteDir);
  run("npm", ["run", "deploy"], siteDir);
}

function run(cmd, args, cwd) {
  execFileSync(cmd, args, { cwd, stdio: "inherit" });
}

function ensureGitRepo(siteDir, repoUrl) {
  if (!fs.existsSync(path.join(siteDir, ".git"))) {
    run("git", ["init"], siteDir);
  }
  if (repoUrl) {
    const existing = getCommandOutput("git", ["remote"], siteDir).split(/\s+/).filter(Boolean);
    if (existing.includes("origin")) {
      run("git", ["remote", "set-url", "origin", repoUrl], siteDir);
    } else {
      run("git", ["remote", "add", "origin", repoUrl], siteDir);
    }
  }
  const hasOrigin = getCommandOutput("git", ["remote", "get-url", "origin"], siteDir).trim();
  if (!hasOrigin) {
    throw new Error("No git remote origin configured. Pass --repo-url <github-repo-url> or create the repo with GitHub CLI first.");
  }
  run("git", ["add", "."], siteDir);
  try {
    run("git", ["commit", "-m", "Generate travel action cards"], siteDir);
  } catch {
    console.log("No source changes to commit.");
  }
  run("git", ["branch", "-M", "main"], siteDir);
  run("git", ["push", "-u", "origin", "main"], siteDir);
}

function getCommandOutput(cmd, args, cwd) {
  try {
    return execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

function isTransportText(text) {
  return /飞机|航班|高铁|火车|打车|机场|车站|出发|到达|直飞|转机|轮渡|公交|地铁|步行|开车|巴士|大巴|taxi|train|flight/i.test(text);
}

function inferTransportType(text) {
  if (/飞机|航班|直飞|转机|机场/.test(text)) return "飞机";
  if (/高铁|火车|车站|train/i.test(text)) return "火车";
  if (/打车|taxi/i.test(text)) return "打车";
  if (/公交|地铁|巴士|大巴/.test(text)) return "公共交通";
  if (/步行/.test(text)) return "步行";
  if (/轮渡/.test(text)) return "轮渡";
  return "交通";
}

function inferTransportCode(text) {
  const match = text.match(/[A-Z0-9]{1,3}\\d{2,5}/);
  return match ? match[0] : "";
}

function inferDeparture(city, text) {
  const parts = splitRoute(city || text);
  return parts[0] || "";
}

function inferArrival(city, text) {
  const parts = splitRoute(city || text);
  return parts[1] || "";
}

function splitRoute(text) {
  return clean(text).split(/→|->|—|-/).map(clean).filter(Boolean);
}

function defaultTips() {
  return [
    { id: "tip-1", category: "出门提醒", text: "每天出门前看一眼今日行程，确认交通、门票、酒店和必带物品。" },
    { id: "tip-2", category: "隐私提醒", text: "公开链接里不要放护照号、订单号、详细房号和私人电话。" },
  ];
}

function defaultPacking() {
  return [
    ["证件", "护照/身份证"],
    ["钱包", "银行卡/现金"],
    ["电子", "手机充电器"],
    ["电子", "充电宝"],
    ["电子", "当地手机卡/国际漫游"],
    ["衣物", "换洗衣物"],
    ["洗护", "牙刷牙膏"],
    ["药品", "常用药"],
  ].map(([category, name], index) => ({ id: `pack-${index + 1}`, category, name }));
}

function inferTitle(excelPath, days) {
  const firstCity = days[0]?.city || "旅行";
  const base = path.basename(excelPath, path.extname(excelPath));
  if (base && !/^sample|template|行程$/i.test(base)) return base;
  return `${firstCity}旅行行动卡`;
}

function shortTitle(title) {
  return title.length > 8 ? title.slice(0, 8) : title;
}

function clean(value) {
  if (value == null) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function slugify(value) {
  const ascii = String(value)
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return ascii || `trip-${Date.now()}`;
}

function escapeJsonString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
