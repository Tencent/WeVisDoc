import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const deprecatedProjectName = new RegExp(["WeVision", "Doc"].join(""));
const basePath = process.env.PAGES_BASE_PATH ?? "";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("exports the finished WeVisDoc project page", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
  assert.match(
    html,
    /<title>WeVisDoc: From Coverage to Capability for Robust End-to-End Document Parsing<\/title>/i,
  );
  assert.match(html, /Hao Yu/);
  assert.match(html, /Chen Li<sup>‡<\/sup>/);
  assert.match(html, /Jing LYU/);
  assert.match(html, /Corresponding author/);
  assert.match(html, /From Coverage to Capability for Robust.*End-to-End Document Parsing/s);
  assert.match(html, /95\.38/);
  assert.match(html, /75\.54/);
  assert.match(html, /\+4\.03/);
  assert.match(html, /65\.87/);
  assert.match(html, /99\.22/);
  assert.match(html, /OmniDocBench v1\.6/);
  assert.match(html, /PureDocBench/);
  assert.match(html, /https:\/\/github\.com\/Tencent\/WeVisDoc/);
  assert.match(html, /https:\/\/huggingface\.co\/Tencent\/WeVisDoc-4B/);
  assert.match(html, /https:\/\/huggingface\.co\/Tencent\/WeVisDoc-2B/);
  assert.match(html, /https:\/\/arxiv\.org\/abs\/2609\.20423/);
  assert.match(html, /arXiv:2609\.20423/);
  assert.match(html, /https:\/\/tencent\.github\.io\/WeVisDoc\/og\.png/);
  assert.match(
    html,
    new RegExp(`${escapeRegExp(basePath)}/cases/odb_sudoku_marked\\.jpg`),
  );
  assert.match(
    html,
    new RegExp(`${escapeRegExp(basePath)}/wechat-icon\\.png`),
  );
  assert.match(
    html,
    new RegExp(`${escapeRegExp(basePath)}/_next/static/`),
  );
  const rootRelativeUrls = [
    ...html.matchAll(/(?:src|href)="(\/[^"]+)"/g),
  ].map((match) => match[1]);
  for (const url of rootRelativeUrls) {
    assert.ok(
      url.startsWith(`${basePath}/`),
      `root-relative URL does not include the Pages base path: ${url}`,
    );
  }

  assert.doesNotMatch(html, deprecatedProjectName);
  assert.doesNotMatch(html, /main\.pdf/i);
  assert.doesNotMatch(html, /Report · Coming soon/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
  assert.doesNotMatch(html, /react-loading-skeleton/i);
});

test("ships every report-backed asset in a static-only application", async () => {
  const [page, layout, nextConfig, packageJson, workflow] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
  ]);

  const caseImages = [...page.matchAll(/image:\s*"(\/cases\/[^"]+)"/g)].map(
    (match) => match[1],
  );
  const expectedCaseImages = [
    "/cases/odb_sudoku_marked.jpg",
    "/cases/odb_diagram_marked.jpg",
    "/cases/odb_peripheral_marked.jpg",
    "/cases/pdb_clean_legal_marked.jpg",
    "/cases/pdb_clean_itinerary_marked.jpg",
    "/cases/pdb_clean_carotid_marked.jpg",
    "/cases/pdb_digital_formula_marked.jpg",
    "/cases/pdb_digital_notes_marked.jpg",
    "/cases/pdb_digital_fw_marked.jpg",
    "/cases/pdb_real_news_marked.jpg",
    "/cases/pdb_real_contract_marked.jpg",
    "/cases/pdb_real_clinical_marked.jpg",
  ];
  assert.deepEqual(caseImages, expectedCaseImages);

  await Promise.all(
    caseImages.map((path) => access(new URL(`../public${path}`, import.meta.url))),
  );
  await Promise.all([
    access(new URL("../out/index.html", import.meta.url)),
    access(new URL("../out/_next", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/wechat-logo.png", import.meta.url)),
    access(new URL("../public/wechat-icon.png", import.meta.url)),
  ]);

  assert.match(layout, /export const metadata/);
  assert.match(layout, /\/og\.png/);
  assert.doesNotMatch(layout, /next\/headers|headers\(\)/);
  assert.match(nextConfig, /output:\s*"export"/);
  assert.match(nextConfig, /basePath/);
  assert.match(nextConfig, /PAGES_BASE_PATH/);
  assert.match(workflow, /branches:\s*\n\s*-\s+page/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path:\s*\.\/out/);
  assert.match(page, /Chen Li<sup>‡<\/sup>/);
  assert.match(page, /title: "Table coverage"/);
  assert.match(page, /title: "Reading order"/);
  assert.match(page, /title: "Measurement-grid coverage"/);
  assert.match(page, /title: "Field–value pairing"/);
  assert.match(page, /title: "Cross-document hallucination"/);
  assert.doesNotMatch(page, deprecatedProjectName);
  assert.doesNotMatch(page, /main\.pdf/i);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton|vinext|wrangler|cloudflare|vite/i);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await assert.rejects(access(new URL("public/_sites-preview", root)));
  await assert.rejects(access(new URL("../vite.config.ts", import.meta.url)));
  await assert.rejects(access(new URL("../sites-vite-plugin.ts", import.meta.url)));
  await assert.rejects(access(new URL("../worker/index.ts", import.meta.url)));
  await assert.rejects(access(new URL("../.openai/hosting.json", import.meta.url)));
});

test("keeps the qualitative predictions literal", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const literalPredictionFragments = [
    "<table><tr><td>5</td>",
    "陈述语气\\n祈使语气\\n语气",
    "结构和显著的重叠",
    "Primary Standard(Level)",
    "Airport Pickup Matrix 接机安排 (Apr 19-20)",
    "右侧颈动脉 Right Carotid ★",
    "用于决定异常响应是否升级为 maintenance escalation 或生产会议通报项。",
    "Diluted EPSNote 2",
    "GW-IoT-4200 Edge Gateway",
    "not a placeholder underscore.",
    "91440300MA5FP7TN8K",
    "la 直接原因",
  ];

  for (const fragment of literalPredictionFragments) {
    assert.ok(page.includes(fragment), `missing literal prediction fragment: ${fragment}`);
  }

  assert.doesNotMatch(
    page,
    /\[(?:The|Page-level|Footer|IMT|Matching|Column-major|Labels)[^\]]*\]/,
  );
  assert.doesNotMatch(
    page,
    /The (?:formula is emitted|displayed expression is serialized)/,
  );
});
