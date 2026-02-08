# Website 文件重组计划

## 目标结构

```
grassroots-website/
├── README.md
├── index.html           (首页，保留在根目录)
├── pages/               (页面文件夹)
│   ├── about.html
│   ├── tasks.html
│   ├── kanban.html
│   └── join.html
├── assets/              (资源文件夹)
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── gh-api.js
└── .gitignore           (保留)
```

## 重组原因

1. **清晰分层**：页面与资源分离
2. **便于维护**：资源集中管理
3. **可扩展性**：添加新资源时不需要混乱
4. **行业标准**：符合现代 Web 项目规范

## 影响范围

需要更新以下文件中的链接：
- pages/about.html
- pages/tasks.html
- pages/kanban.html
- pages/join.html

需要更新的链接类型：
- CSS 引用：`href="styles.css"` → `href="../assets/css/styles.css"`
- JS 引用：`src="gh-api.js"` → `src="../assets/js/gh-api.js"`
- 导航链接：`href="index.html"` → `href="../index.html"`
- 页面间链接：`href="about.html"` → `href="about.html"`
- 其他资源：根据相对路径调整
