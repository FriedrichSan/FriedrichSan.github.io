// ============================================================
//  内容配置 —— 把下面的占位内容替换成你自己的信息即可
//  所有场景、动画、排版都会自动跟随这份配置更新
// ============================================================

export const site = {
  name: "YunKai Ji",
  tagline: "student in higher-dimensional algebraic geometry",
  // 个人介绍（点击奇点处的箭头弹出）
  bio: [
    "My name is YunKai Ji. I am a student working in higher-dimensional algebraic geometry under the supervision of ZhengYu Hu.",
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

// Talk 与 Note —— 排布在 strict transform 扭成的 twisted cubic 上
export interface Talk {
  title: string;
  event: string;
  date: string;
  kind: "talk" | "note";
  abstract: string;
  href: string;
}

export const talks: Talk[] = [
  {
    title: "Birational Geometry Seminar",
    event: "Personal notes",
    date: "2026",
    kind: "note",
    abstract: "A seminar lecture note in Birational Geometry, especially the Minimal Model Program",
    href: "/notes/birational-geometry.pdf",
  },
  {
    title: "Application of the Bend-and-Break technique",
    event: "Personal notes",
    date: "2026",
    kind: "note",
    abstract: "An application of the bend and break, gives a result that every point in smooth projective Fano variety there is a rational curves passing through it, and satisfies some length condition.",
    href: "/notes/bend_and_break_applications_revised.pdf",
  },
  {
    title: "Mori's Cone Theorem",
    event: "Personal notes",
    date: "2026",
    kind: "note",
    abstract: "Mori's Cone Theorem, corrected by GPT6 Astra Model, the original version from my Birational Geometry seminar note",
    href: "/notes/mori_cone_theorem_revised.pdf",
  },
  {
    title: "Chapter 1: Ample and Nef Line Bundles",
    event: "Personal notes",
    date: "2026",
    kind: "note",
    abstract: "Ample and Nef Line Bundles, revised by GPT6 Astra Model, the original version from my Birational Geometry seminar note in Chapter 1",
    href: "/notes/chapter1_ample_nef_revised.pdf",
  },
  {
    title: "Chapter 3: Linear Series",
    event: "Personal notes",
    date: "2026",
    kind: "note",
    abstract: "Linear series which is about bigness and Iitaka dimension, revised by GPT6 Astra Model, the original version from my Birational Geometry seminar note in Chapter 3",
    href: "/notes/chapter3_linear_series_revised.pdf",
  },
  {
    title: "Chapter 4: Vanishing Theorems",
    event: "Personal notes",
    date: "2026",
    kind: "note",
    abstract: "Useful vanishing theorems, revised by GPT6 Astra Model, the original version from my Birational Geometry seminar note in Chapter 4",
    href: "/notes/chapter4_vanishing_revised.pdf",
  },
  {
    title: "Chapter 2: Rational Curvs & Bend and Break",
    event: "Personal notes",
    date: "2026",
    kind: "note",
    abstract: "Deformation theory of rational curves and bend and break technique, revised by GPT6 Astra Model but too brief, the original version from my Birational Geometry seminar note in Chapter 2",
    href: "/notes/chapter2_rational_curves_revised.pdf",
  },
  {
    title: "Chapter 5: Introduction to the Minimal Model Program",
    event: "Personal notes",
    date: "2026",
    kind: "note",
    abstract: "Singularity theory for the minimal model program, revised by GPT6 Astra Model, the original version from my Birational Geometry seminar note in Chapter 5",
    href: "/notes/chapter5_mmp_revised.pdf",
  },
];
