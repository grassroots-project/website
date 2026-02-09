# Grassroots Project Website

为被低估的个体提供夺回定价权的协作基础。

## 项目愿景

- **使命**：为被低估的个体提供夺回定价权的协作基础
- **愿景**：构建一个价值被发现的网络，让每个参与者都能通过协作获得非线性成长
- **核心主张**：价值不是被赋予的，是被发现的

## 三条腿

1. **比特币**：信任基础 — 去中心化的价值存储，不依赖权威
2. **计算机和网络**：协作机制 — 远程协作，降低协作成本
3. **大语言模型**：认知共识 — AI 降低参与博弈的认知门槛

成长机制：三者不是相加，而是**相乘**。这是指数级成长的核心来源。

## 功能

### 池塘系统

| 页面 | 功能 | 链接 |
|------|------|------|
| 📋 任务池 | 查看开放任务，GitHub 登录后一键领取 | [/pages/tasks.html](https://www.grassroots-project.app/pages/tasks.html) |
| 📊 看板 | 实时查看任务进度（待领/进行中/已完成） | [/pages/kanban.html](https://www.grassroots-project.app/pages/kanban.html) |
| 👥 人才库 | 成员信息、技能标签、贡献记录 | [/pages/people.html](https://www.grassroots-project.app/pages/people.html) |
| 📦 资源池 | 共享资源（比特币、知识、工具） | [/pages/resources.html](https://www.grassroots-project.app/pages/resources.html) |

### AI 助手

- 🤖 对话式问答，了解项目愿景和规则
- 📋 根据你的技能智能推荐任务
- 🚀 引导新人加入流程
- 🔑 使用 Kimi (Moonshot) API，用户自己输入 API Key

[访问 AI 助手](https://www.grassroots-project.app/pages/assistant.html)

### 任务领取

- 🔑 GitHub Personal Access Token 登录
- 🙋 一键领取任务（自动打标签 + 评论 + Assign）
- ✅ 一键标记完成
- 👋 支持放弃任务

## 技术栈

- **前端**：纯静态 HTML/CSS/JS，无框架依赖
- **部署**：GitHub Pages
- **数据**：GitHub Issues API（任务池、人才库、资源池）
- **AI**：Kimi (Moonshot) API
- **Markdown 渲染**：marked.js

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/grassroots-project/website.git
cd website

# 直接打开 index.html，或启动本地服务器
python -m http.server 8000
# 访问 http://localhost:8000
```

## 文件结构

```
.
├── index.html              # 首页
├── README.md               # 本文件
├── assets/
│   ├── css/
│   │   └── styles.css      # 公共样式
│   └── js/
│       ├── auth.js         # GitHub PAT 认证模块
│       ├── task-actions.js # 任务领取/放弃/完成
│       └── gh-api.js       # GitHub API 封装
└── pages/
    ├── about.html          # 关于页面
    ├── tasks.html          # 任务池（含登录和领取功能）
    ├── kanban.html         # 看板视图
    ├── people.html         # 人才库
    ├── resources.html      # 资源池
    ├── assistant.html      # AI 助手
    └── join.html           # 加入我们
```

## 相关仓库

| 仓库 | 说明 |
|------|------|
| [grassroots-project/website](https://github.com/grassroots-project/website) | 本仓库，项目网站 |
| [grassroots-project/tasks](https://github.com/grassroots-project/tasks) | 任务池、人才库、资源池（GitHub Issues） |
| [grassroots-project/docs](https://github.com/grassroots-project/docs) | 项目文档和资料 |

## 如何加入

1. 阅读 [关于页面](https://www.grassroots-project.app/pages/about.html)
2. 完成 [筛选问卷](https://www.grassroots-project.app/pages/join.html)
3. 发送答案到 xiaoping.tang@gmail.com
4. 收到回复后，添加你的信息到人才库

或者直接和 [AI 助手](https://www.grassroots-project.app/pages/assistant.html) 对话了解更多。

## License

MIT
