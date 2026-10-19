// ============================================================
//  内容配置 —— 把下面的占位内容替换成你自己的信息即可
//  所有场景、动画、排版都会自动跟随这份配置更新
// ============================================================

export const site = {
  name: "YunKai Ji",
  tagline: "a student in higher-dimensional algebraic geometry",
  // 个人介绍（点击奇点处的箭头弹出）
  bio: [
    "My name is YunKai Ji, a student working in higher-dimensional algebraic geometry under the supervision of ZhengYu Hu.",
  ],
  links: [
    { label: "Email", href: "mailto:fsanchez@foxmail.com" },
    { label: "GitHub", href: "https://github.com/FriedrichSan" },
  ],
};

// 论文与工作 —— 排布在 exceptional curve 拉成的圆周上（E ≅ P¹）
export interface Work {
  title: string;
  coauthors?: string;
  venue: string;
  year: string;
  abstract: string;
  href: string;
}

export const papers: Work[] = [];

// Talk 与 Note —— 按主题排布在 strict transform 展开的 curve family 上。
// 每个 note 用 category 指定它属于哪个方向，没写的会归到 "Other"。
export interface Talk {
  id?: string;
  title: string;
  event: string;
  date: string;
  kind: "talk" | "note";
  category?: string;
  abstract: string;
  href?: string;
}

// 方向 —— 每个方向在曲线族里占一条曲线。
// parameter ∈ [-1, 1]：负数画在左边、正数画在右边；曲线只有 7 条
// （-1, -0.65, -0.32, 0, 0.32, 0.65, 1），所以最多 6 个方向（0 留给过场那条曲线）。
// number 是卡片上的方向编号，与曲线位置无关，按加入方向的先后排。
export const noteGroups = [
  {
    id: "birational",
    number: 1,
    title: "Birational geometry",
    subtitle: "birational maps & the minimal model program",
    symbol: "B",
    parameter: -1,
  },
  {
    id: "modern-mmp",
    number: 3,
    title: "Modern Minimal Model Program",
    subtitle: "flips, termination & abundance",
    symbol: "M",
    parameter: -0.5,
  },
  {
    id: "vmrt",
    number: 2,
    title: "VMRT",
    subtitle: "varieties of minimal rational tangents",
    symbol: "V",
    parameter: 1,
  },
] as const;

export const talks: Talk[] = [
  {
    id: "birational-geometry-seminar",
    title: "Birational Geometry Seminar",
    event: "Personal notes",
    date: "2026",
    kind: "note",
    category: "birational",
    abstract: "A seminar lecture note in Birational Geometry, especially the Minimal Model Program",
    href: "/notes/birational-geometry.pdf",
  },
  {
    id: "birational-geometry-revised",
    title: "Birational Geometry revised",
    event: "Personal notes",
    date: "2026",
    kind: "note",
    category: "birational",
    abstract: "Revised by GPT6 Astra Model and me. But be careful that, the revised version is very terse.",
    href: "/notes/bgr.pdf",
  },
  {
    id: "hilbert-schemes",
    title: "Hilbert Schemes",
    event: "VMRT seminar",
    date: "2026",
    kind: "note",
    category: "vmrt",
    abstract: "Seminar note on Hilbert schemes.",
    href: "/notes/hilbert-schemes.pdf",
  },
  {
    id: "incidence-schemes",
    title: "Incidence Schemes",
    event: "VMRT seminar",
    date: "2026",
    kind: "note",
    category: "vmrt",
    abstract: "Seminar note on incidence schemes.",
    href: "/notes/incidence-schemes.pdf",
  },
  {
    id: "stable-maps",
    title: "Stable Maps: Basic Definitions",
    event: "VMRT seminar",
    date: "2026",
    kind: "note",
    category: "vmrt",
    abstract: "Basic definitions for stable maps.",
    href: "/notes/stable-maps-basic-definitions.pdf",
  },
];
