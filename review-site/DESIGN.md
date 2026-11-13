# DESIGN.md · C 语言期中复习工作台

## 视觉世界

**红笔批注的复习讲义。**

一张米白纸，黑色正文，细灰分隔线；重点和当前状态用朱红标注，像老师批改时留下的笔迹。
不做卡片堆叠、不做渐变、不做玻璃拟态。层级靠字号、留白和 1px 横线建立，像一份排版讲究的打印稿。

模式：**Operate**。工具要消失，任务要清楚。

## 颜色

| Token | 值 | 用途 |
|---|---|---|
| `--paper` | `#FAF8F3` | 页面底色 |
| `--surface` | `#FFFFFF` | 输入区、代码面板 |
| `--ink` | `#1C1B18` | 正文 |
| `--muted` | `#6F6A60` | 次要文字 |
| `--rule` | `#E2DED3` | 分隔线 |
| `--rule-strong` | `#C9C3B6` | 强调分隔线 |
| `--accent` | `#B23A2B` | 当前项、主按钮、红笔强调 |
| `--accent-soft` | `#F4E4DF` | 强调底色 |
| `--success` | `#2F6B4F` | 正确、通过 |
| `--success-soft` | `#E5EEE8` | 正确底色 |
| `--warning` | `#8A6218` | 警告 |
| `--code-bg` | `#F3F0E8` | 代码块 |

对比度：正文/纸 ≥ 12:1；muted/纸 ≥ 5:1；accent/纸 ≥ 5:1。

## 字体

- UI：`"Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif`
- 阅读正文：`"Noto Serif SC", "SimSun", Georgia, serif`（只用于知识文章，制造「讲义」感）
- 代码：`"Consolas", "Cascadia Mono", monospace`

固定 rem 阶梯：12 / 13 / 14 / 16 / 18 / 22 / 28 / 36。不用流体字号。

## 布局

- 顶栏 56px，sticky，底部 1px 线
- 左侧章节栏 232px，移动端折叠为顶部横向滚动
- 主内容最大宽度：阅读 720px，练习 760px，编程 1100px
- 间距基数 4px；区块之间 40–56px，标题上方大于下方

## 组件

- 按钮：1px 边框、4px 圆角、无阴影；主按钮朱红实底；hover 加深；focus 2px 外圈
- 选项：整行可点，左侧字母徽标；选中后朱红描边；正确绿底、错误红底
- 代码编辑器：行号栏 + 透明 textarea + 高亮层；Tab 插入 4 空格
- 输出面板：等宽、深色文字、浅米底；stderr 用深红
- 状态：默认 / hover / focus / active / disabled / loading / error / empty 全部实现

## 动效

- 150–220ms，`cubic-bezier(.22,1,.36,1)`
- 唯一「作者时刻」：全部测试通过时，右上角落下「通过」印章（轻微旋转、缩放淡入），1 次
- 其余只有状态反馈，不做页面入场编排

## 可访问性

- 所有交互可键盘到达，focus-visible 明显
- 选项用 `role="radiogroup"` + `aria-checked`
- 运行结果用 `aria-live="polite"`
- 颜色不作为唯一信息载体（对错同时有文字与图标）