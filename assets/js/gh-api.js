// GitHub API 配置
const CONFIG = {
  owner: 'grassroots-project',
  repo: 'tasks',
  // 可选：如果仓库是私有的，需要 Personal Access Token
  // token: 'your_github_token'
};

// GitHub API 基础 URL
const API_BASE = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}`;

// 设置 API 请求头
function getHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (CONFIG.token) {
    headers['Authorization'] = `token ${CONFIG.token}`;
  }
  return headers;
}

// 获取所有 Issues（任务）
export async function fetchTasks() {
  try {
    const response = await fetch(
      `${API_BASE}/issues?state=open&sort=created&direction=desc&per_page=100`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

// 获取人池内容
export async function fetchPeoplePool() {
  try {
    const response = await fetch(
      `${API_BASE}/issues?state=open&labels=人池`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch people pool');
    const issues = await response.json();
    return issues.length > 0 ? issues[0] : null;
  } catch (error) {
    console.error('Error fetching people pool:', error);
    return null;
  }
}

// 获取资源池内容
export async function fetchResourcePool() {
  try {
    const response = await fetch(
      `${API_BASE}/issues?state=open&labels=资源池`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch resource pool');
    const issues = await response.json();
    return issues.length > 0 ? issues[0] : null;
  } catch (error) {
    console.error('Error fetching resource pool:', error);
    return null;
  }
}

// 解析任务标签
export function parseTaskLabels(labels) {
  const result = {
    priority: null,
    status: null,
    skills: []
  };

  for (const label of labels) {
    const name = label.name;
    const nameLower = name.toLowerCase();
    // 兼容大小写：P0/p0, P1/p1, P2/p2
    if (['p0', 'p1', 'p2'].includes(nameLower)) {
      result.priority = nameLower;
    } else if (['待领', '进行中', '已完成'].includes(name)) {
      result.status = name;
    } else {
      result.skills.push(name);
    }
  }

  return result;
}

// 从任务描述中提取字段
export function parseTaskDescription(body) {
  const result = {
    description: '',
    skills: '',
    time: '',
    links: '',
    assignee: ''
  };

  if (!body) return result;

  const lines = body.split('\n');
  let currentSection = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentSection = line.slice(3).trim();
    } else if (currentSection && line.trim()) {
      switch (currentSection) {
        case '任务描述':
          result.description += line + '\n';
          break;
        case '技能要求':
          result.skills = line.trim();
          break;
        case '预期时间':
          result.time = line.trim();
          break;
        case '相关链接':
          result.links = line.trim();
          break;
        case '领取':
          result.assignee = line.trim();
          break;
      }
    }
  }

  return result;
}

// 渲染任务卡片
export function renderTaskCard(issue) {
  const labels = parseTaskLabels(issue.labels);
  const details = parseTaskDescription(issue.body);

  const priorityColors = {
    p0: 'bg-red-500',
    p1: 'bg-yellow-500',
    p2: 'bg-green-500'
  };

  const priorityText = {
    p0: '必须先做',
    p1: '重要不紧急',
    p2: '探索性'
  };

  const statusColors = {
    待领: 'bg-purple-500',
    进行中: 'bg-green-500',
    已完成: 'bg-gray-500'
  };

  return `
    <div class="task-card">
      <h3><a href="${issue.html_url}" target="_blank">${issue.title}</a></h3>
      <div class="task-meta">
        <span class="priority ${priorityColors[labels.priority] || 'bg-gray-500'}">
          ${priorityText[labels.priority] || '未知优先级'}
        </span>
        <span class="status ${statusColors[labels.status] || 'bg-gray-500'}">
          ${labels.status || '待领'}
        </span>
        ${labels.skills.length > 0 ? `
          <span class="skills">
            ${labels.skills.join(', ')}
          </span>
        ` : ''}
      </div>
      ${details.time ? `<div class="task-time">⏱ ${details.time}</div>` : ''}
      ${details.description ? `<div class="task-description">${details.description.trim()}</div>` : ''}
      ${details.assignee ? `<div class="task-assignee">👤 ${details.assignee}</div>` : ''}
    </div>
  `;
}

// 渲染任务列表
export function renderTaskList(tasks, filter = {}) {
  let filteredTasks = tasks.filter(issue => !issue.pull_request);

  if (filter.priority) {
    filteredTasks = filteredTasks.filter(issue =>
      issue.labels.some(label => label.name === filter.priority)
    );
  }

  if (filter.status) {
    filteredTasks = filteredTasks.filter(issue =>
      issue.labels.some(label => label.name === filter.status)
    );
  }

  if (filter.skill) {
    filteredTasks = filteredTasks.filter(issue =>
      issue.labels.some(label => label.name === filter.skill)
    );
  }

  if (filteredTasks.length === 0) {
    return '<p class="no-tasks">没有找到任务</p>';
  }

  return filteredTasks.map(issue => renderTaskCard(issue)).join('');
}
