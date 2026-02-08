# Website 文件结构

## 目录树

```
grassroots-website/
├── .git/                    # Git 仓库
├── .gitignore               # Git 忽略规则
├── README.md                # 项目说明
├── REORGANIZE.md            # 重组说明
├── index.html               # 首页（根目录，GitHub Pages 要求）
├── pages/                   # 页面文件夹
│   ├── about.html          # 关于页面
│   ├── tasks.html          # 任务池页面
│   ├── kanban.html         # 看板页面
│   └── join.html           # 加入我们页面
├── assets/                  # 资源文件夹
│   ├── css/                # 样式文件
│   │   └── styles.css      # 主样式表
│   └── js/                 # JavaScript 文件
│       └── gh-api.js       # GitHub API 调用
└── .gitignore              # Git 忽略文件
```

## 文件说明

### 根目录文件

| 文件 | 说明 |
|------|------|
| `index.html` | 首页，必须位于根目录（GitHub Pages 要求） |
| `README.md` | 项目说明文档 |
| `.gitignore` | Git 忽略规则配置 |

### pages/ 目录

| 文件 | 说明 | URL |
|------|------|-----|
| `about.html` | 关于页面 | `/pages/about.html` |
| `tasks.html` | 任务池页面 | `/pages/tasks.html` |
| `kanban.html` | 看板页面 | `/pages/kanban.html` |
| `join.html` | 加入我们页面 | `/pages/join.html` |

### assets/ 目录

#### css/ 子目录

| 文件 | 说明 | 引用方式 |
|------|------|---------|
| `styles.css` | 主样式表 | `../assets/css/styles.css` (从 pages/) 或 `assets/css/styles.css` (从根目录) |

#### js/ 子目录

| 文件 | 说明 | 引用方式 |
|------|------|---------|
| `gh-api.js` | GitHub API 调用代码 | `../assets/js/gh-api.js` |

## 链接规则

### 根目录文件中的链接

```html
<!-- CSS 引用 -->
<link rel="stylesheet" href="assets/css/styles.css">

<!-- 页面链接 -->
<a href="pages/about.html">关于</a>
<a href="pages/tasks.html">任务池</a>
<a href="pages/kanban.html">看板</a>
<a href="pages/join.html">加入我们</a>
```

### pages/ 目录中的链接

```html
<!-- CSS 引用 -->
<link rel="stylesheet" href="../assets/css/styles.css">

<!-- JS 引用 -->
<script src="../assets/js/gh-api.js"></script>

<!-- 导航链接 -->
<a href="../index.html">首页</a>
<a href="about.html">关于</a>
<a href="tasks.html">任务池</a>
<a href="kanban.html">看板</a>
<a href="join.html">加入我们</a>
```

## 部署 URL

| 页面 | URL |
|------|-----|
| 首页 | `https://grassroots-project.github.io/website/` |
| 关于 | `https://grassroots-project.github.io/website/pages/about.html` |
| 任务池 | `https://grassroots-project.github.io/website/pages/tasks.html` |
| 看板 | `https://grassroots-project.github.io/website/pages/kanban.html` |
| 加入我们 | `https://grassroots-project.github.io/website/pages/join.html` |

## 添加新页面的步骤

1. 在 `pages/` 目录创建新的 HTML 文件
2. 复制现有页面的导航栏和结构
3. 更新所有页面的导航链接
4. 提交并推送

## 添加新资源的步骤

### CSS 文件
1. 在 `assets/css/` 创建新的 CSS 文件
2. 在 HTML 中引用：`href="../assets/css/your-style.css"`

### JavaScript 文件
1. 在 `assets/js/` 创建新的 JS 文件
2. 在 HTML 中引用：`src="../assets/js/your-script.js"`

## 注意事项

1. **index.html 必须位于根目录**：GitHub Pages 要求
2. **使用相对路径**：不要使用绝对路径
3. **更新所有导航链接**：添加新页面时要更新所有现有页面的导航
4. **资源集中管理**：所有 CSS/JS 文件都放在 assets/ 目录下
