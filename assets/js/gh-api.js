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

// 获取人才库（从数据文件）
export async function fetchPeoplePool() {
  try {
    const response = await fetch(
      `${API_BASE}/contents/data/people.md`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch people data');
    const data = await response.json();
    // 解码 base64 内容
    const content = atob(data.content);
    return {
      body: content,
      html_url: `${data.html_url}`,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching people pool:', error);
    return null;
  }
}

// 获取资源池（从数据文件）
export async function fetchResourcePool() {
  try {
    const response = await fetch(
      `${API_BASE}/contents/data/resources.md`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch resource data');
    const data = await response.json();
    // 解码 base64 内容
    const content = atob(data.content);
    return {
      body: content,
      html_url: `${data.html_url}`,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching resource pool:', error);
    return null;
  }
}

// 解析人才库 Markdown
export function parsePeoplePool(markdown) {
  const lines = markdown.split('\n');
  const members = [];
  let currentMember = null;

  for (const line of lines) {
    if (line.startsWith('### ')) {
      // 保存上一个成员
      if (currentMember) {
        members.push(currentMember);
      }
      // 开始新成员
      currentMember = {
        name: line.replace('### ', '').trim(),
        joined: '',
        skills: '',
        time: '',
        current: '',
        history: ''
      };
    } else if (currentMember && line.includes('：')) {
      const [key, value] = line.split('：');
      const trimmedKey = key.trim().replace(/\*\*/g, '');
      switch (trimmedKey) {
        case '加入时间':
          currentMember.joined = value.trim();
          break;
        case '技能标签':
          currentMember.skills = value.trim();
          break;
        case '时间承诺':
          currentMember.time = value.trim();
          break;
        case '当前任务':
          currentMember.current = value.trim();
          break;
        case '历史贡献':
          currentMember.history = value.trim();
          break;
      }
    }
  }

  // 保存最后一个成员
  if (currentMember) {
    members.push(currentMember);
  }

  return members;
}

// 解析资源池 Markdown
export function parseResourcePool(markdown) {
  const lines = markdown.split('\n');
  const resources = [];
  let currentResource = null;

  for (const line of lines) {
    if (line.startsWith('### ')) {
      // 保存上一个资源
      if (currentResource) {
        resources.push(currentResource);
      }
      // 开始新资源
      currentResource = {
        name: line.replace('### ', '').trim(),
        type: '',
        description: '',
        status: '',
        owner: '',
        instructions: '',
        link: ''
      };
    } else if (currentResource && line.includes('：')) {
      const [key, value] = line.split('：');
      const trimmedKey = key.trim().replace(/\*\*/g, '');
      switch (trimmedKey) {
        case '类型':
          currentResource.type = value.trim();
          break;
        case '描述':
          currentResource.description = value.trim();
          break;
        case '当前状态':
          currentResource.status = value.trim();
          break;
        case '负责人':
          currentResource.owner = value.trim();
          break;
        case '使用说明':
          currentResource.instructions = value.trim();
          break;
        case '链接':
          currentResource.link = value.trim();
          break;
      }
    }
  }

  // 保存最后一个资源
  if (currentResource) {
    resources.push(currentResource);
  }

  return resources;
}
