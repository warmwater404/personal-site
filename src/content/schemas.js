/* ============================================================================
 *  区块类型登记表
 *  ---------------------------------------------------------------------------
 *  这里定义了「页面上能放哪些区块」「每种区块有哪些字段」。
 *  编辑模式里的表单、以及页面的渲染，都由这张表驱动。
 *
 *  想扩展：在下面加一项，并在 components/blocks/ 里写对应的组件即可。
 * ==========================================================================*/

import HeroBlock from "../components/blocks/HeroBlock.jsx";
import AboutBlock from "../components/blocks/AboutBlock.jsx";
import ProjectsBlock from "../components/blocks/ProjectsBlock.jsx";
import LinksBlock from "../components/blocks/LinksBlock.jsx";
import TextBlock from "../components/blocks/TextBlock.jsx";

/* 字段类型说明：
 *   text      单行文本
 *   textarea  多行文本
 *   strings   一组短文本（例如技能标签），可增删排序
 *   items     一组对象（例如作品卡片、经历条目），可增删排序，内部字段可嵌套
 */
const _TEXT = (key, label, hint) => ({ key, label, type: "text", hint });
const _AREA = (key, label, rows, hint) => ({ key, label, type: "textarea", rows, hint });
const _STRINGS = (key, label, blank, hint) => ({
  key,
  label,
  type: "strings",
  blank: blank === undefined ? "" : blank,
  hint,
});

export const BLOCK_TYPES = {
  /* ---------------------------------------------------------------- 首屏 */
  hero: {
    label: "首屏介绍",
    icon: "🏠",
    singleton: true,
    defaultNavLabel: "首页",
    Component: HeroBlock,
    blank: {
      eyebrow: "你好，我是",
      name: "你的名字",
      avatar: "./avatar.svg",
      headline: "一句话说明你是谁",
      subheadline: "再写两三句自我描述，让人快速了解你。",
      location: "中国 · 你的城市",
      email: "hello@example.com",
      socials: [{ label: "GitHub", url: "https://github.com/yourname" }],
    },
    fields: [
      _TEXT("eyebrow", "顶部小字", "例如「你好，我是」"),
      _TEXT("name", "姓名"),
      _TEXT("avatar", "头像地址", "把图片放进 public/ 目录后填 ./图片名.jpg，也可以直接填完整网址"),
      _TEXT("headline", "一句话身份", "例如「前端开发 / 全栈工程师」"),
      _AREA("subheadline", "自我描述", 3),
      _TEXT("location", "所在地"),
      _TEXT("email", "邮箱", "用于页脚的「发邮件」按钮"),
      {
        key: "socials",
        label: "首屏按钮",
        type: "items",
        itemLabel: "按钮",
        titleKey: "label",
        blank: { label: "新按钮", url: "https://" },
        fields: [
          _TEXT("label", "按钮文字"),
          _TEXT("url", "链接地址", "填 # 表示占位，不跳转"),
        ],
      },
    ],
  },

  /* -------------------------------------------------------------- 关于我 */
  about: {
    label: "关于我",
    icon: "👤",
    defaultNavLabel: "关于我",
    Component: AboutBlock,
    blank: {
      eyebrow: "关于我",
      title: "一点自我介绍",
      paragraphs: ["在这里写一段自我介绍。"],
      skillsTitle: "技能",
      skills: ["新技能"],
      timelineTitle: "经历",
      timeline: [
        {
          period: "2024 — 至今",
          title: "职位或专业",
          org: "公司或学校",
          desc: "一句话说明你做了什么。",
        },
      ],
    },
    fields: [
      _TEXT("eyebrow", "小标题"),
      _TEXT("title", "区块标题"),
      _STRINGS("paragraphs", "自我介绍段落", "", "每个段落一条，篇幅建议 2～3 段"),
      _TEXT("skillsTitle", "技能栏标题"),
      _STRINGS("skills", "技能标签", ""),
      _TEXT("timelineTitle", "经历栏标题"),
      {
        key: "timeline",
        label: "经历条目",
        type: "items",
        itemLabel: "经历",
        titleKey: "title",
        blank: { period: "年份", title: "职位或专业", org: "公司或学校", desc: "" },
        fields: [
          _TEXT("period", "时间", "例如 2023 — 至今"),
          _TEXT("title", "职位 / 专业"),
          _TEXT("org", "公司 / 学校"),
          _AREA("desc", "补充说明", 2),
        ],
      },
    ],
  },

  /* -------------------------------------------------------------- 作品集 */
  projects: {
    label: "作品集",
    icon: "🧩",
    defaultNavLabel: "作品集",
    Component: ProjectsBlock,
    blank: {
      eyebrow: "作品集",
      title: "做过的项目",
      items: [
        {
          title: "新项目",
          summary: "一句话说清这个项目解决了什么问题。",
          tags: [],
          url: "",
          year: "",
        },
      ],
    },
    fields: [
      _TEXT("eyebrow", "小标题"),
      _TEXT("title", "区块标题"),
      {
        key: "items",
        label: "作品卡片",
        type: "items",
        itemLabel: "作品",
        titleKey: "title",
        blank: { title: "新作品", summary: "", tags: [], url: "", year: "" },
        fields: [
          _TEXT("title", "标题"),
          _AREA("summary", "简介", 2),
          _STRINGS("tags", "标签", ""),
          _TEXT("url", "项目链接", "留空则不显示「查看项目」按钮"),
          _TEXT("year", "年份"),
        ],
      },
    ],
  },

  /* -------------------------------------------------------------- 收藏夹 */
  links: {
    label: "收藏夹",
    icon: "🔗",
    defaultNavLabel: "收藏夹",
    Component: LinksBlock,
    blank: {
      eyebrow: "收藏夹",
      title: "我常去的地方",
      groups: [
        {
          title: "新分组",
          items: [{ label: "新链接", url: "https://", desc: "" }],
        },
      ],
    },
    fields: [
      _TEXT("eyebrow", "小标题"),
      _TEXT("title", "区块标题"),
      {
        key: "groups",
        label: "链接分组",
        type: "items",
        itemLabel: "分组",
        titleKey: "title",
        blank: { title: "新分组", items: [] },
        fields: [
          _TEXT("title", "分组名称"),
          {
            key: "items",
            label: "分组内的链接",
            type: "items",
            itemLabel: "链接",
            titleKey: "label",
            blank: { label: "新链接", url: "https://", desc: "" },
            fields: [
              _TEXT("label", "显示文字"),
              _TEXT("url", "链接地址"),
              _TEXT("desc", "右侧备注", "例如「代码托管」，留空则不显示"),
            ],
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------ 自由文字 */
  text: {
    label: "自由文字",
    icon: "📝",
    defaultNavLabel: "文字",
    Component: TextBlock,
    blank: {
      eyebrow: "",
      title: "新段落",
      body: "在这里写任何你想说的话。\n\n空一行就会分成新的段落。",
    },
    fields: [
      _TEXT("eyebrow", "小标题"),
      _TEXT("title", "区块标题"),
      _AREA("body", "正文", 8, "空一行 = 新段落"),
    ],
  },
};

/** 添加区块面板里的排列顺序 */
export const BLOCK_TYPE_ORDER = ["hero", "about", "projects", "links", "text"];

export function getBlockMeta(type) {
  return (
    BLOCK_TYPES[type] || {
      label: type,
      icon: "❓",
      defaultNavLabel: "区块",
      Component: null,
      blank: {},
      fields: [],
    }
  );
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** 生成一个新区块实例 */
export function createBlock(type) {
  const meta = getBlockMeta(type);
  return {
    id: `blk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    type,
    visible: true,
    showInNav: true,
    navLabel: meta.defaultNavLabel,
    data: clone(meta.blank),
  };
}

/** 顶部导航的条目（可见 + 勾选了显示在导航里） */
export function buildNavItems(blocks) {
  const items = blocks
    .filter((block) => block.visible && block.showInNav !== false)
    .map((block) => ({
      id: block.id,
      label: block.navLabel || getBlockMeta(block.type).defaultNavLabel,
    }));

  items.push({ id: "contact", label: "联系" });
  return items;
}
