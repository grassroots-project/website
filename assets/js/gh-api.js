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
    // 直接用 raw URL 获取内容，避免 base64 解码问题
    const response = await fetch(
      `https://raw.githubusercontent.com/${CONFIG.owner}/${CONFIG.repo}/main/data/people.md`
    );
    if (!response.ok) throw new Error('Failed to fetch people data');
    const content = await response.text();
    return {
      body: content,
      html_url: `https://github.com/${CONFIG.owner}/${CONFIG.repo}/blob/main/data/people.md`,
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching people pool:', error);
    return null;
  }
}

// 获取资源池（从数据文件）
export async function fetchResourcePool() {
  try {
    // 直接用 raw URL 获取内容，避免 base64 解码问题
    const response = await fetch(
      `https://raw.githubusercontent.com/${CONFIG.owner}/${CONFIG.repo}/main/data/resources.md`
    );
    if (!response.ok) throw new Error('Failed to fetch resource data');
    const content = await response.text();
    return {
      body: content,
      html_url: `https://github.com/${CONFIG.owner}/${CONFIG.repo}/blob/main/data/resources.md`,
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching resource pool:', error);
    return null;
  }
}

// 解析人才库 Markdown
export function parsePeoplePool(markdown) {
  // 提取成员区域：从 "## 成员" 或 "## 现有成员" 到下一个 "---" 或 "##"
  const memberSectionMatch = markdown.match(/^##\s+(成员|现有成员)\s*\n([\s\S]*?)(?=\n---|\n##\s|$)/m);
  if (!memberSectionMatch) {
    return [];
  }

  const memberSection = memberSectionMatch[2];
  const members = [];
  let currentMember = null;

  for (const line of memberSection.split('\n')) {
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
      const colonIndex = line.indexOf('：');
      const key = line.substring(0, colonIndex).trim().replace(/\*\*/g, '').replace(/^-\s*/, '');
      const value = line.substring(colonIndex + 1).trim();
      
      switch (key) {
        case 'GitHub':
          currentMember.github = value;
          break;
        case '加入时间':
          currentMember.joined = value;
          break;
        case '技能标签':
          currentMember.skills = value;
          break;
        case '时间承诺':
          currentMember.time = value;
          break;
        case '当前任务':
          currentMember.current = value;
          break;
        case '历史贡献':
          currentMember.history = value;
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
  // Extract only the "## 资源列表" section
  const sectionMatch = markdown.match(/^## 资源列表\s*\n([\s\S]*?)(?=\n---|\n## )/m);
  if (!sectionMatch) return [];

  const lines = sectionMatch[1].split('\n');
  const resources = [];
  let currentResource = null;
  let currentField = null; // Track multi-line fields like 链接/使用说明

  const fieldNames = ['资源类型', '类型', '描述', '当前状态', '负责人', '使用说明', '链接'];

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (currentResource) resources.push(currentResource);
      currentResource = {
        name: line.replace('### ', '').trim(),
        type: '', description: '', status: '', owner: '', instructions: '', link: '', links: []
      };
      currentField = null;
    } else if (!currentResource) {
      continue;
    } else if (line.match(/^-\s*\*\*/) && line.includes('：')) {
      // Main field line: - **字段名**：值
      const colonIdx = line.indexOf('：');
      const key = line.substring(0, colonIdx).trim().replace(/\*\*/g, '').replace(/^-\s*/, '');
      const value = line.substring(colonIdx + 1).trim();

      currentField = null;
      switch (key) {
        case '资源类型': case '类型': currentResource.type = value; break;
        case '描述': currentResource.description = value; break;
        case '当前状态': currentResource.status = value; break;
        case '负责人': currentResource.owner = value; break;
        case '使用说明':
          currentResource.instructions = value;
          currentField = 'instructions';
          break;
        case '链接':
          currentResource.link = value;
          currentField = 'link';
          break;
      }
    } else if (currentField && line.match(/^\s+-\s/) && line.includes('：')) {
      // Sub-item line:   - 子项名：值 (for 链接/使用说明)
      const colonIdx = line.indexOf('：');
      const subLabel = line.substring(0, colonIdx).trim().replace(/^-\s*/, '');
      const subValue = line.substring(colonIdx + 1).trim();

      if (currentField === 'link') {
        currentResource.links.push({ label: subLabel, url: subValue });
        // Set first sub-link as primary if main link is empty
        if (!currentResource.link || currentResource.link === '-') {
          currentResource.link = subValue;
        }
      } else if (currentField === 'instructions') {
        currentResource.instructions += (currentResource.instructions ? '；' : '') + subLabel + '：' + subValue;
      }
    } else {
      // Non-matching line, reset field tracking
      if (line.trim() === '') currentField = null;
    }
  }

  if (currentResource) resources.push(currentResource);
  return resources;
}
