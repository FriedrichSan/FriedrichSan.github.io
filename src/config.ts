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

export const talks: Talk[] = [];
