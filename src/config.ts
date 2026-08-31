// ============================================================
//  内容配置 —— 把下面的占位内容替换成你自己的信息即可
//  所有场景、动画、排版都会自动跟随这份配置更新
// ============================================================

export const site = {
  name: "Y. Geometer", // ← 你的名字
  tagline: "algebraic geometer", // ← 一句话身份
  // 个人介绍（点击奇点处的箭头弹出）
  bio: [
    "I am an algebraic geometer. I think about moduli spaces, birational geometry, and the quiet beauty of singularities.",
    "This homepage is organized the way a geometer would resolve a singularity: by blowing up. The node you just saw is my curve; everything I do lives on its resolution.",
    "Replace this text with your own introduction in src/config.ts.",
  ],
  links: [
    { label: "Email", href: "mailto:you@example.edu" },
    { label: "arXiv", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "CV (pdf)", href: "#" },
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

export const papers: Work[] = [
  {
    title: "Moduli of sheaves on nodal curves",
    coauthors: "with A. Collaborator",
    venue: "preprint",
    year: "2026",
    abstract:
      "We construct a compactified moduli space of torsion-free sheaves on nodal curves and describe its boundary via elementary modifications along the exceptional divisor.",
    href: "#",
  },
  {
    title: "Blow-ups and the derived category",
    venue: "Journal of Example Geometry",
    year: "2025",
    abstract:
      "A semiorthogonal decomposition for the derived category of a blow-up, with applications to rationality questions in low dimension.",
    href: "#",
  },
  {
    title: "Twisted cubics and stable maps",
    coauthors: "with B. Coauthor and C. Coauthor",
    venue: "preprint",
    year: "2024",
    abstract:
      "The twisted cubic appears as the general fiber of a family of stable maps; we compute the corresponding Gromov–Witten invariants.",
    href: "#",
  },
  {
    title: "On the resolution of surface singularities",
    venue: "Proceedings of the Example Society",
    year: "2023",
    abstract:
      "A self-contained account of embedded resolution for surfaces, organized around the combinatorics of exceptional configurations.",
    href: "#",
  },
  {
    title: "Deformations of the node",
    venue: "Example Mathematical Notes",
    year: "2022",
    abstract:
      "We study the semi-universal deformation of the ordinary double point and its simultaneous resolution after base change.",
    href: "#",
  },
];

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
    title: "How to blow up a point",
    event: "Example Algebraic Geometry Seminar",
    date: "Spring 2026",
    kind: "talk",
    abstract:
      "An expository talk: the blow-up of affine space at the origin, its charts, and why the exceptional divisor is a projective space.",
    href: "#",
  },
  {
    title: "Notes on intersection theory",
    event: "graduate course notes",
    date: "2025",
    kind: "note",
    abstract:
      "Lecture notes covering Chow groups, Chern classes, and the excess intersection formula, with many worked examples on blow-ups.",
    href: "#",
  },
  {
    title: "The geometry of the twisted cubic",
    event: "Example Conference on Curves",
    date: "Fall 2024",
    kind: "talk",
    abstract:
      "The rational normal curve of degree three: its secant variety, its equations, and its role as the strict transform of a plane nodal cubic.",
    href: "#",
  },
  {
    title: "A user's guide to the Veronese embedding",
    event: "expository note",
    date: "2024",
    kind: "note",
    abstract:
      "Everything you always wanted to know about ν₃: P¹ ↪ P³, affine cones, and projections to plane cubics with singularities.",
    href: "#",
  },
  {
    title: "Resolution of singularities, gently",
    event: "Example Summer School",
    date: "Summer 2023",
    kind: "talk",
    abstract:
      "A gentle introduction to Hironaka's theorem in dimension two, with the node and the cusp as running examples.",
    href: "#",
  },
];
