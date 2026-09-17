"use client";

import { useMemo, useState } from "react";

type DatasetId = "odb" | "clean" | "digital" | "real";

const repositoryUrl = "https://github.com/Tencent/WeVisDoc";
const model4BUrl = "https://huggingface.co/Tencent/WeVisDoc-4B";
const model2BUrl = "https://huggingface.co/Tencent/WeVisDoc-2B";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function assetPath(path: string) {
  return `${basePath}${path}`;
}

type DemoCase = {
  dataset: DatasetId;
  title: string;
  eyebrow: string;
  image: string;
  metric: string;
  submetric: string;
  diagnosis: string;
  before: string;
  after: string;
};

const benchmarks = [
  {
    name: "OmniDocBench",
    descriptor: "v1.6 · diverse documents",
    ours: 95.38,
    baseline: 94.74,
    baselineName: "HunyuanOCR-1.5",
    gain: "+0.64",
  },
  {
    name: "PureDocBench Clean",
    descriptor: "source-traceable clean pages",
    ours: 79.81,
    baseline: 78.38,
    baselineName: "FD-RL",
    gain: "+1.43",
  },
  {
    name: "PureDocBench Digital Degraded",
    descriptor: "10 algorithmic degradations",
    ours: 77.74,
    baseline: 76.33,
    baselineName: "FD-RL",
    gain: "+1.41",
  },
  {
    name: "PureDocBench Real Degraded",
    descriptor: "4 physical capture chains",
    ours: 69.08,
    baseline: 67.64,
    baselineName: "Logics-Parsing-v2",
    gain: "+1.44",
  },
];

const stageGains = [
  { label: "OmniDocBench", value: "+1.16" },
  { label: "PDB · Clean", value: "+0.49" },
  { label: "PDB · Digital", value: "+2.55" },
  { label: "PDB · Real", value: "+4.03" },
];

const datasetMeta: Array<{ id: DatasetId; label: string; short: string }> = [
  { id: "odb", label: "OmniDocBench v1.6", short: "ODB" },
  { id: "clean", label: "PureDocBench · Clean", short: "Clean" },
  { id: "digital", label: "PureDocBench · Digital Degraded", short: "Digital" },
  { id: "real", label: "PureDocBench · Real Degraded", short: "Real" },
];

const demoCases: DemoCase[] = [
  {
    dataset: "odb",
    title: "Table coverage",
    eyebrow: "Case 01 · OmniDocBench (a)",
    image: "/cases/odb_sudoku_marked.jpg",
    metric: "Overall 65.87 → 99.22",
    submetric: "TableTEDS 0.333 → 1.000",
    diagnosis: "Stage I omits the 9×9 Sudoku grid; Stage II restores the complete table.",
    before: `Fig. 10.3 Solved sudoku puzzle.\n\n## 10.4 Hybrid Optimization\nHybrid methods may be required to solve particularly difficult real-world optimization problems. Implementation of hybrid methods typically requires non-trivial scripting\n…`,
    after: `<table><tr><td>5</td><td>3</td><td>4</td><td>6</td><td>7</td><td>8</td><td>9</td><td>1</td><td>2</td></tr>\n…\n<tr><td>3</td><td>4</td><td>5</td><td>2</td><td>8</td><td>6</td><td>1</td><td>7</td><td>9</td></tr></table>\n\nFig. 10.3 Solved sudoku puzzle.\n\n### 10.4 Hybrid Optimization\n…`,
  },
  {
    dataset: "odb",
    title: "Diagram coverage",
    eyebrow: "Case 02 · OmniDocBench (b)",
    image: "/cases/odb_diagram_marked.jpg",
    metric: "Overall 58.98 → 100.00",
    submetric: "TextEdit 0.410 → 0.000",
    diagnosis: "Stage I omits the intervening semantic hierarchy; Stage II restores it.",
    before: `## 语气的概述\n\n语气可以分为陈述语气、祈使语气和虚拟语气。虚拟语气又有七种基本结构。\n\n## 一 陈述语气\n陈述语气表示所说的话是陈述事实、提出想法。\n…`,
    after: `## 语气的概述\n\n语气可以分为陈述语气、祈使语气和虚拟语气。虚拟语气又有七种基本结构。\n\n陈述语气\n祈使语气\n语气\n动词原形\n动词的过去式\nhad + 过去分词\n虚拟语气\nshould + 动词原形\n…\n## 一 陈述语气\n…`,
  },
  {
    dataset: "odb",
    title: "Peripheral text coverage",
    eyebrow: "Case 03 · OmniDocBench (c)",
    image: "/cases/odb_peripheral_marked.jpg",
    metric: "Overall 67.66 → 100.00",
    submetric: "TextEdit 0.323 → 0.000",
    diagnosis: "Stage I misses the page-level figure title, footer, and page number; Stage II restores them.",
    before: `## 企业依赖复杂、多层和互通的架构\n案例:半导体、计算机和电子产品以及通讯设备\n\n## 戴尔\n2019年收入：900亿美金\n…\n## 联想\n2019年收入：510亿美金\n…\n资料来源:彭博供应链数据库；麦肯锡全球研究所分析`,
    after: `## 图E3 即使在同一个行业中，企业也可能有非常不同的供应链结构和显著的重叠\n\n企业依赖复杂、多层和互通的架构\n案例:半导体、计算机和电子产品以及通讯设备\n\n戴尔\n2019年收入：900亿美金\n…\n联想\n2019年收入：510亿美金\n…\n资料来源:彭博供应链数据库；麦肯锡全球研究所分析\n\n全球价值链中的风险、韧性和再平衡\n9`,
  },
  {
    dataset: "clean",
    title: "Document hierarchy",
    eyebrow: "Case 04 · PureDocBench Clean (a)",
    image: "/cases/pdb_clean_legal_marked.jpg",
    metric: "Overall 3.46 → 98.30",
    submetric: "TextEdit 0.996 → 0.033",
    diagnosis: "Stage I collapses the page hierarchy into a table; Stage II restores the headings and genuine table.",
    before: `<table><tr><td>PART A — MOTOR VEHICLE EMISSION AND FUEL STANDARDS</td></tr><tr><td>§7521. Emission standards for new motor vehicles or new motor vehicle engines</td></tr>\n…\n<tr><td>Table 1 — National Ambient Air Quality Standards (NAAQS)</td></tr><tr><td>Pollutant</td><td>Primary Standard(Level)</td><td>Secondary Standard(Level)</td><td>Averaging Time</td><td>Form</td></tr>\n…\n</table>`,
    after: `## PART A — MOTOR VEHICLE EMISSION AND FUEL STANDARDS\n\n## §7521. Emission standards for new motor vehicles or new motor vehicle engines\n\n(a) Authority of Administrator to prescribe by regulation.— Except as otherwise provided in subsection (b), the Administrator shall by regulation prescribe\n…\n## §7409. National Ambient Air Quality Standards\n…\nTable 1 — National Ambient Air Quality Standards (NAAQS)\n<table><tr><td>Pollutant</td><td>Primary Standard (Level)</td><td>Secondary Standard (Level)</td><td>Averaging Time</td><td>Form</td></tr>\n…`,
  },
  {
    dataset: "clean",
    title: "Reading order",
    eyebrow: "Case 05 · PureDocBench Clean (b)",
    image: "/cases/pdb_clean_itinerary_marked.jpg",
    metric: "Overall 49.00 → 94.64",
    submetric: "TextEdit 0.510 → 0.054",
    diagnosis: "Stage I reads the three-column pickup grid in column-major order; Stage II restores the intended sequence.",
    before: `…\n## Airport Pickup Matrix 接机安排 (Apr 19-20)\n\nCA1501 PEK → PVG\nApr 19 14:20 | 8 pax | Shuttle A1\n\nKE897 ICN → PVG\nApr 19 17:10 | 8 pax | Shuttle B1\n\nBA169 LHR → PVG\nApr 20 06:15 | 15 pax | Shuttle C1\n\nUA857 SFO → PVG\nApr 20 07:45 | 14 pax | Shuttle C2\n…`,
    after: `…\n## Airport Pickup Matrix 接机安排 (Apr 19-20)\n\nCA1501 PEK → PVG\nApr 19 14:20 | 8 pax | Shuttle A1\n\nMU5101 CAN → PVG\nApr 19 15:45 | 6 pax | Shuttle A1\n\nNH919 NRT → PVG\nApr 19 16:35 | 12 pax | Shuttle B1\n\nKE897 ICN → PVG\nApr 19 17:10 | 8 pax | Shuttle B1\n…`,
  },
  {
    dataset: "clean",
    title: "Measurement-grid coverage",
    eyebrow: "Case 06 · PureDocBench Clean (c)",
    image: "/cases/pdb_clean_carotid_marked.jpg",
    metric: "Overall 48.88 → 91.96",
    submetric: "TableTEDS 0.366 → 0.901",
    diagnosis: "Stage I omits both carotid hemodynamics tables; Stage II restores the measurement grids.",
    before: `…\n左侧颈动脉 Left Carotid\n\n斑块分析 Plaque Analysis (Left)\n狭窄计算 Stenosis Calculation\n<table><tr><td>编号</td><td>位置</td><td>大小mm</td><td>回声</td><td>表面</td><td>GSM</td><td>溃疡</td></tr>\n…\n</table>\n…\n右侧颈动脉 Right Carotid ★\n\n斑块分析 Plaque An\n<table><tr><td>编号</td><td>位置</td><td>大小mm</td><td>回声</td><td>表面</td><td>GSM</td><td>溃疡</td></tr>\n…`,
    after: `…\n## 左侧颈动脉 Left Carotid\n<table><tr><th>血管节段</th><th>IMT mm</th><th>ID mm</th><th>PSV cm/s</th><th>EDV cm/s</th><th>RI</th></tr><tr><td>CCA近段</td><td>0.8</td><td>6.4</td><td>76.5</td><td>21.2</td><td>0.72</td></tr>\n…\n<tr><td>VA V3段</td><td>-</td><td>3.2</td><td>44.8</td><td>15.2</td><td>0.66</td></tr></table>\n\n斑块分析 Plaque Analysis (Left)\n…`,
  },
  {
    dataset: "digital",
    title: "Formula serialization",
    eyebrow: "Case 07 · PureDocBench Digital (a)",
    image: "/cases/pdb_digital_formula_marked.jpg",
    metric: "Overall 65.28 → 98.70",
    submetric: "FormulaCDM 0.000 → 1.000",
    diagnosis: "Stage I emits display mathematics as ordinary text; Stage II restores the LaTeX block.",
    before: `…\n## 5.2 LOTO 与 Permit-to-Work\n\n执行检修、换模、开盖、进入防护罩内作业前，必须进行 Lockout / Tagout。\n…\nDowntime Risk\n\nDowntime Risk = Fault Frequency × Recovery Time\n\n用于决定异常响应是否升级为 maintenance escalation 或生产会议通报项。\n\n## 5.3 班组 KPI 与 Toolbox Meeting\n…`,
    after: `…\n### 5.2 LOTO 与 Permit-to-Work\n\n执行检修、换模、开盖、进入防护罩内作业前，必须进行 Lockout / Tagout。\n…\n#### Downtime Risk\n\n$$Downtime\\ Risk = Fault\\ Frequency \\times Recovery\\ Time$$\n\n用于决定异常响应是否升级为 maintenance escalation 或生产会议通报项。\n\n### 5.3 班组 KPI 与 Toolbox Meeting\n…`,
  },
  {
    dataset: "digital",
    title: "Table-boundary recovery",
    eyebrow: "Case 08 · PureDocBench Digital (b)",
    image: "/cases/pdb_digital_notes_marked.jpg",
    metric: "Overall 51.76 → 98.59",
    submetric: "TextEdit 0.862 → 0.027",
    diagnosis: "Stage I extends a table across non-tabular notes and signatures; Stage II restores the boundary.",
    before: `…\n<tr><td>Diluted EPSNote 2</td><td>$3.28</td><td>$2.54</td><td>$1.25</td><td>+29.1%</td></tr>\n…\n<tr><td colspan="5">NOTE: This consolidated statement of operations reflects combined performance across all operating segments including:\n…\n<tr><td colspan="5">AUDITOR&#x27;S CERTIFICATION: This Consolidated Statement of Operations, including all notes and supplementary schedules, has been audited …</td></tr><tr><td>Chief Financial Officer</td><td>Controller</td><td></td><td>Chief Executive Officer</td><td></td></tr>\n…`,
    after: `…\n<tr><td>Diluted EPSNote 2</td><td>$3.28</td><td>$2.54</td><td>$1.25</td><td>+29.1%</td></tr>\n…\n</table>\n\nNOTE: This consolidated statement of operations reflects combined performance across all operating segments including:\n…\nAUDITOR'S CERTIFICATION: This Consolidated Statement of Operations, including all notes and supplementary schedules, has been audited\n…\nChief Financial Officer\n…\nController\n…\nChief Executive Officer\n…`,
  },
  {
    dataset: "digital",
    title: "Field–value pairing",
    eyebrow: "Case 09 · PureDocBench Digital (c)",
    image: "/cases/pdb_digital_fw_marked.jpg",
    metric: "Overall 57.25 → 92.47",
    submetric: "TextEdit 0.428 → 0.075",
    diagnosis: "Stage I separates metadata labels from their values; Stage II re-pairs every firmware field.",
    before: `Device Model 设备型号:\nCurrent FW 当前固件:\nTarget FW 目标固件:\nBuild Date 构建日期:\nArchitecture 架构:\nImage Size 镜像大小:\n\nGW-IoT-4200 Edge Gateway\nv4.1.8 (build 20250911)\nv4.2.1 (build 20260401)\n2026-04-01 08:30:00 UTC\nARMv8-A Cortex-A72\n48.7 MB\n…`,
    after: `Device Model 设备型号: GW-IoT-4200 Edge Gateway\nCurrent FW 当前固件: v4.1.8 (build 20250911)\nTarget FW 目标固件: v4.2.1 (build 20260401)\nBuild Date 构建日期: 2026-04-01 08:30:00 UTC\nArchitecture 架构: ARMv8-A Cortex-A72\nImage Size 镜像大小: 48.7 MB\n\n## [NEW] 新增功能 / New Features\n…`,
  },
  {
    dataset: "real",
    title: "Cross-document hallucination",
    eyebrow: "Case 10 · PureDocBench Real (a)",
    image: "/cases/pdb_real_news_marked.jpg",
    metric: "Overall 31.43 → 94.13",
    submetric: "TextEdit 0.681 → 0.057",
    diagnosis: "Stage I diverges into unrelated Chinese disclosure text and repeated mathematics; Stage II restores page-consistent newspaper content while localized recognition errors remain under physical acquisition conditions.",
    before: `## THE FINANCIAL CHRONICLE\n…\nVol. 02171, No. 69\n…\nS&P 500 3,738.92 +42.18 (+0.75%)\n…\n1. 2017年，公司与上海浦东发展银行股份有限公司签订了《关于使用部分闲置募集资金进行现金管理的协议》。\n…\nThe Ground Truth image displays a single, solid horizontal line. According to Rule 2 (UNDERSCORE & LINE RULES), this is a stylistic or background line, not a placeholder underscore.\n…\n$\\therefore m = \\frac{3}{11}$\n…`,
    after: `## THE FINANCIAL CHRONICLE\nVol CXIV, No 20\nSunday, March 17, 2025\nNew York London Hong Kong Tokyo Frankfurt\nDJIA 42.186.57 • 287.41 (+0.65%)\nS&P 500 3,738.92 +42.18 (+0.74%)\n…\n## Fed Holds Rates Steady, Signals Two Cuts Remain on Table for 2025\nPowell cites "unusually elevated uncertainty" from tariff policies; dot plot unchanged from December projections\nBY JAMES WHITFIELD AND SARAH CHEH | FEDERAL RESERVE CORRESPONDENTS\nWASHINGTON — The Federal Reserve held its benchmark interest rate unchanged at 4.25%-4.50% on Wednesday, as widely expected\n…`,
  },
  {
    dataset: "real",
    title: "Text and formula recovery",
    eyebrow: "Case 11 · PureDocBench Real (b)",
    image: "/cases/pdb_real_contract_marked.jpg",
    metric: "Overall 64.61 → 97.70",
    submetric: "FormulaCDM 0.024 → 1.000",
    diagnosis: "Stage I misreads a name and serializes the displayed expression as prose; Stage II recovers both.",
    before: `…\n第一条 各方基本信息\n<table>\n…\n<tr><td>乙方(受让方)</td><td colspan="3">深圳前海汇智投资合伙企业(有限合伙)</td></tr><tr><td>统一社会信用代码</td><td>91440300MA5FP7TN8K</td><td>执行事务合伙人</td><td>林露铭</td></tr>\n…\n</table>\n…\n## 第七条 违约责任\n\n7.1 任何一方违反本协议项下的义务、陈述或保证的，…\n\n违约金 = 股权转让总对价 × 10% + 逾期付款金额 × 0.05% × 逾期天数\n…`,
    after: `…\n第一条 各方基本信息\n<table>\n…\n<tr><td>乙方(受让方)</td><td colspan="3">深圳前海汇智投资合伙企业(有限合伙)</td></tr><tr><td>统一社会信用代码</td><td>91440300MA5FP7TN8K</td><td>执行事务合伙人</td><td>林嘉铭</td></tr>\n…\n</table>\n…\n## 第七条 违约责任\n\n7.1 任何一方违反本协议项下的义务、陈述或保证的，…\n\n$$\n\\text{违约金} = \\text{股权转让总对价} \\times 10 \\% + \\text{逾期付款金额} \\times 0.05 \\% \\times \\text{逾期天数}\n$$\n…`,
  },
  {
    dataset: "real",
    title: "Section serialization",
    eyebrow: "Case 12 · PureDocBench Real (c)",
    image: "/cases/pdb_real_clinical_marked.jpg",
    metric: "Overall 67.08 → 96.66",
    submetric: "TextEdit 0.648 → 0.056",
    diagnosis: "Stage I overtabularizes the clinical form; Stage II restores its linear sections while localized recognition errors remain.",
    before: `…\n二、直接死亡原因链 Cause of Death Chain\n<table><tr><td>1a 直接原因</td><td>感染性休克、多器官功能衰竭(MOF) Septic shock with multiple organ failure</td></tr><tr><td></td><td>↑ 由于 due to</td></tr><tr><td>1b 前因</td><td>重症肺炎(多重耐药菌感染) Severe pneumonia …</td></tr>\n…\n</table>\n\n三、讨论发言记录\n<table><tr><td>汇报医师:李明 住院医师</td></tr>\n…`,
    after: `…\n## 二、直接死亡原因链 Cause of Death Chain\n\nla 直接原因 感染性休克、多器官功能衰竭(MOF) …\n↑ 由于 due to\nlb 前因 重症肺炎(多重耐药菌感染) …\n↑ 由于 due to\nIc 根因 社区获得性肺炎，免疫功能低下 …\nII 促进因素 2型糖尿病(20年，HbA1c 9.8%) …\n…\n## 三、讨论发言记录\n汇报医师：李明 住院医师\n…\n感染科会诊意见：王教授 主任医师\n…\nICU主治：陈副主任医师\n…`,
  },
];

function scoreWidth(score: number) {
  return `${Math.max(4, Math.min(100, ((score - 60) / 40) * 100))}%`;
}

export default function Home() {
  const [activeDataset, setActiveDataset] = useState<DatasetId>("odb");
  const [activeCase, setActiveCase] = useState(0);

  const visibleCases = useMemo(
    () => demoCases.filter((item) => item.dataset === activeDataset),
    [activeDataset],
  );
  const selected = visibleCases[activeCase] ?? visibleCases[0];

  function chooseDataset(dataset: DatasetId) {
    setActiveDataset(dataset);
    setActiveCase(0);
  }

  function moveCase(direction: number) {
    setActiveCase((current) =>
      (current + direction + visibleCases.length) % visibleCases.length,
    );
  }

  return (
    <main>
      <nav className="nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="WeVisDoc home">
          <img src={assetPath("/wechat-logo.png")} alt="" />
          <span>We</span><strong>VisDoc</strong>
        </a>
        <div className="navLinks">
          <a href="#results">Results</a>
          <a href="#demo">Demo lab</a>
          <a href="#method">Method</a>
          <a href="#models">Models</a>
        </div>
        <a className="navPaper" href={repositoryUrl} target="_blank" rel="noreferrer">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </nav>

      <header className="hero" id="top">
        <div className="heroGrid" aria-hidden="true" />
        <div className="heroGlow heroGlowA" aria-hidden="true" />
        <div className="heroGlow heroGlowB" aria-hidden="true" />
        <div className="documentWall" aria-hidden="true">
          <div className="documentCard cardA">
            <img src={assetPath("/cases/odb_sudoku_marked.jpg")} alt="" />
          </div>
          <div className="documentCard cardB">
            <img src={assetPath("/cases/pdb_real_contract_marked.jpg")} alt="" />
          </div>
          <div className="documentCard cardC">
            <img src={assetPath("/cases/pdb_digital_formula_marked.jpg")} alt="" />
          </div>
          <div className="scanBeam" />
        </div>

        <div className="heroContent">
          <p className="kicker"><span>TECHNICAL REPORT</span> COVERAGE → CAPABILITY</p>
          <h1>
            <span>We</span><em>Vis</em><span>Doc</span>
          </h1>
          <p className="heroTitle">From Coverage to Capability for Robust<br />End-to-End Document Parsing</p>
          <p className="authors">
            Hao Yu<sup>*</sup>, Kang Liu<sup>*</sup>, Linnan Zhao<sup>*</sup>, Jiabo Zhan<sup>*</sup>, Chong Sun<sup>†</sup>, Chen Li<sup>‡</sup>, Jing LYU
          </p>
          <p className="affiliation">
            WeChat Vision Team, Tencent Inc. <span><sup>*</sup> Equal contribution. <sup>†</sup> Project leader. <sup>‡</sup> Corresponding author.</span>
          </p>
          <p className="heroAbstract">
            Document parsing converts document images into structured content and requires reliable performance across diverse layouts and acquisition conditions. We present WeVisDoc, a <b>two-stage data-centric framework for robust end-to-end document parsing</b>. Stage I broadens semantic, structural, and appearance coverage; Stage II uses residual-error diagnostics to guide targeted data construction and reallocation.
          </p>
          <div className="heroActions">
            <a className="button primary" href="#demo"><span className="liveDot" />Explore 12 recoveries</a>
            <a className="button ghost" href={model4BUrl} target="_blank" rel="noreferrer">WeVisDoc-4B <span aria-hidden="true">↗</span></a>
            <a className="button ghost" href={model2BUrl} target="_blank" rel="noreferrer">WeVisDoc-2B <span aria-hidden="true">↗</span></a>
            <span className="button ghost disabledButton" aria-disabled="true">Report · Coming soon</span>
          </div>
          <div className="heroStats" aria-label="Headline results">
            <div><span>OmniDocBench v1.6</span><strong>95.38</strong><small>Overall · 4B</small></div>
            <div><span>PureDocBench</span><strong>75.54</strong><small>Avg₃ · 4B</small></div>
            <div><span>Model family</span><strong>2B / 4B</strong><small>End-to-end</small></div>
          </div>
        </div>
        <div className="heroRail" aria-hidden="true">
          <span>TEXT</span><i /><span>FORMULA</span><i /><span>TABLE</span><i /><span>READING ORDER</span>
        </div>
      </header>

      <section className="section resultsSection" id="results">
        <div className="sectionHeading">
          <p className="sectionTag">01 / END-TO-END LEADERBOARD</p>
          <h2>Four views. One parser.<br /><span>No pipeline hand-offs.</span></h2>
          <p>WeVisDoc-4B against the strongest reported end-to-end specialist on each benchmark view. Every value is the Overall score.</p>
        </div>

        <div className="chartShell">
          <div className="chartTopbar">
            <div className="chartLegend"><span className="legendOurs" /> WeVisDoc-4B <span className="legendBase" /> Strongest E2E baseline</div>
            <span className="chartStatus"><i /> VERIFIED RESULTS</span>
          </div>
          <div className="axis" aria-hidden="true"><span>60</span><span>70</span><span>80</span><span>90</span><span>100</span></div>
          <div className="benchmarkRows">
            {benchmarks.map((item) => (
              <article className="benchmarkRow" key={item.name}>
                <div className="benchmarkLabel">
                  <h3>{item.name}</h3>
                  <p>{item.descriptor}</p>
                </div>
                <div className="bars">
                  <div className="barLine">
                    <span className="barName">OURS</span>
                    <div className="barTrack">
                      <div className="bar oursBar" style={{ width: scoreWidth(item.ours) }}><strong>{item.ours.toFixed(2)}</strong></div>
                    </div>
                  </div>
                  <div className="barLine">
                    <span className="barName">PRIOR</span>
                    <div className="barTrack">
                      <div className="bar baseBar" style={{ width: scoreWidth(item.baseline) }}><strong>{item.baseline.toFixed(2)}</strong></div>
                    </div>
                  </div>
                  <p className="baselineName">{item.baselineName}</p>
                </div>
                <div className="gainPill"><span>Δ</span>{item.gain}</div>
              </article>
            ))}
          </div>
          <p className="chartNote">Overall ↑ · The comparison baseline is named per row. The visual axis begins at 60 to make small score differences legible.</p>
        </div>

        <div className="stageGainPanel">
          <div className="stageCopy">
            <p className="miniTag">STAGE II EFFECT · 4B</p>
            <h3>Refinement pays where appearance shifts are hardest.</h3>
            <p>Capability-aware refinement preserves clean-page accuracy while concentrating the largest gain on real captures.</p>
          </div>
          <div className="gainGrid">
            {stageGains.map((gain) => (
              <div key={gain.label}><span>{gain.label}</span><strong>{gain.value}</strong><small>Overall</small></div>
            ))}
          </div>
        </div>
      </section>

      <section className="demoSection" id="demo">
        <div className="section demoInner">
          <div className="sectionHeading leftHeading">
            <p className="sectionTag">02 / INTERACTIVE RECOVERY LAB</p>
            <h2>See what <span>Stage II</span> fixes.</h2>
            <p>Twelve selected pages expose concrete failure modes—not just final scores. Switch benchmark tracks, inspect the marked source, and compare the serialized outputs.</p>
          </div>

          <div className="datasetTabs" role="tablist" aria-label="Demo dataset">
            {datasetMeta.map((dataset) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeDataset === dataset.id}
                className={activeDataset === dataset.id ? "active" : ""}
                onClick={() => chooseDataset(dataset.id)}
                key={dataset.id}
              >
                <span>{dataset.short}</span>{dataset.label}
              </button>
            ))}
          </div>

          <div
            className="demoDeck"
            role="tabpanel"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") moveCase(-1);
              if (event.key === "ArrowRight") moveCase(1);
            }}
          >
            <div className="deckBar">
              <span className="recording"><i /> LIVE COMPARISON</span>
              <span>{selected.eyebrow}</span>
              <span className="caseCount">0{activeCase + 1} / 0{visibleCases.length}</span>
            </div>

            <div className="caseSelector" aria-label="Cases in selected dataset">
              {visibleCases.map((item, index) => (
                <button
                  type="button"
                  className={index === activeCase ? "active" : ""}
                  aria-pressed={index === activeCase}
                  onClick={() => setActiveCase(index)}
                  key={item.title}
                >
                  <span>0{index + 1}</span>{item.title}
                </button>
              ))}
            </div>

            <div className="demoBody">
              <figure className="sourcePane">
                <div className="paneLabel"><span>SOURCE PAGE</span><small>Scroll to inspect</small></div>
                <div className="sourceViewport">
                  <img src={assetPath(selected.image)} alt={`Marked source page for ${selected.title}`} />
                  <div className="scanLine" aria-hidden="true" />
                </div>
                <figcaption>
                  <p>{selected.diagnosis}</p>
                  <div><strong>{selected.metric}</strong><span>{selected.submetric}</span></div>
                </figcaption>
              </figure>

              <div className="outputPane">
                <div className="paneLabel"><span>SERIALIZED OUTPUT</span><small>Markdown-native</small></div>
                <article className="prediction beforePrediction">
                  <header><span><i /> STAGE I</span><small>Broad coverage</small></header>
                  <pre>{selected.before}</pre>
                </article>
                <div className="repairSignal"><span /> capability-aware refinement <span /></div>
                <article className="prediction afterPrediction">
                  <header><span><i /> STAGE II</span><small>Recovered structure</small></header>
                  <pre>{selected.after}</pre>
                </article>
              </div>
            </div>

            <div className="deckFooter">
              <p><span>Tip</span> Use ← and → while this panel is focused.</p>
              <div>
                <button type="button" onClick={() => moveCase(-1)} aria-label="Previous case">← Previous</button>
                <button type="button" onClick={() => moveCase(1)} aria-label="Next case">Next →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section methodSection" id="method">
        <div className="sectionHeading">
          <p className="sectionTag">03 / COVERAGE TO CAPABILITY</p>
          <h2>Train broad. Diagnose precisely.<br /><span>Refine deliberately.</span></h2>
          <p>The architecture stays fixed. What changes is where useful target-token mass is allocated.</p>
        </div>

        <div className="methodFlow">
          <article>
            <div className="methodIndex">01</div>
            <p className="methodKicker">STAGE I · SUPPORT</p>
            <h3>Widen the document manifold</h3>
            <p>Source-balanced heterogeneous data combines semantic coverage with structure-preserving appearance synthesis.</p>
            <div className="methodTokens"><span>domains</span><span>layouts</span><span>degradations</span></div>
          </article>
          <div className="flowArrow" aria-hidden="true"><i /><span>probe</span></div>
          <article className="methodCenter">
            <div className="methodIndex">02</div>
            <p className="methodKicker">DIAGNOSIS · RESIDUALS</p>
            <h3>Find capability regions</h3>
            <p>Held-out probes reveal coherent failure clusters across structure, content, language, and acquisition conditions.</p>
            <div className="clusterMap" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
          </article>
          <div className="flowArrow" aria-hidden="true"><i /><span>reweight</span></div>
          <article>
            <div className="methodIndex">03</div>
            <p className="methodKicker">STAGE II · ALLOCATION</p>
            <h3>Spend tokens on residual gaps</h3>
            <p>Clipped residual-aware weights and curated hard examples strengthen weak regions without displacing natural data.</p>
            <div className="methodTokens"><span>bounded</span><span>audited</span><span>targeted</span></div>
          </article>
        </div>

        <div className="outputStrip">
          <div><span>ONE OUTPUT SPACE</span><strong>Markdown</strong></div>
          <code># Heading</code><code>$$ E = mc² $$</code><code>&lt;table&gt;…&lt;/table&gt;</code>
          <p>Text, formulas, tables, and reading order stay in one inspectable sequence.</p>
        </div>
      </section>

      <section className="citeSection" id="models">
        <div className="section citeInner">
          <div className="citeCopy">
            <p className="sectionTag">04 / OPEN RELEASE</p>
            <h2>Run WeVisDoc.</h2>
            <p>Start with the compact 2B checkpoint or use the 4B checkpoint for the strongest reported results. Code and tutorials are available on GitHub.</p>
            <div className="resourceActions">
              <a className="button primary" href={model4BUrl} target="_blank" rel="noreferrer">Get WeVisDoc-4B <span aria-hidden="true">↗</span></a>
              <a className="button ghost" href={model2BUrl} target="_blank" rel="noreferrer">Get WeVisDoc-2B <span aria-hidden="true">↗</span></a>
              <a className="button ghost" href={repositoryUrl} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className="releaseCard">
            <div className="releaseCardTop"><span>RELEASE LINKS</span><small>2B / 4B</small></div>
            <div className="releaseRows">
              <a href={model4BUrl} target="_blank" rel="noreferrer">
                <span>Model checkpoint</span><strong>WeVisDoc-4B ↗</strong><small>Highest reported results</small>
              </a>
              <a href={model2BUrl} target="_blank" rel="noreferrer">
                <span>Model checkpoint</span><strong>WeVisDoc-2B ↗</strong><small>Compact end-to-end parser</small>
              </a>
              <div>
                <span>Technical report</span><strong>Coming soon</strong><small>Paper and citation will be added here.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <a className="brand footerBrand" href="#top"><img src={assetPath("/wechat-logo.png")} alt="" /><span>We</span><strong>VisDoc</strong></a>
        <p>From coverage to capability for robust end-to-end document parsing.</p>
        <span>WeChat Vision Team · 2026</span>
      </footer>
    </main>
  );
}
