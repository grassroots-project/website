// Task Claim Module
// 任务领取和放弃功能

import { getToken, getUser, isLoggedIn, getAuthHeaders } from './auth.js';

const CONFIG = {
  owner: 'grassroots-project',
  repo: 'tasks'
};

const API_BASE = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}`;

// 领取任务
export async function claimTask(issueNumber) {
  if (!isLoggedIn()) {
    throw new Error('请先登录');
  }
  
  const user = getUser();
  const token = getToken();
  
  // 1. 添加评论
  const commentResponse = await fetch(`${API_BASE}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      body: `🙋 **领取任务**\n\n@${user.login} 领取了这个任务。`
    })
  });
  
  if (!commentResponse.ok) {
    const error = await commentResponse.json();
    throw new Error(error.message || '添加评论失败');
  }
  
  // 2. 更新标签：移除"待领"，添加"进行中"
  await updateTaskLabels(issueNumber, ['待领'], ['进行中']);
  
  // 3. Assign 给自己
  await fetch(`${API_BASE}/issues/${issueNumber}/assignees`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assignees: [user.login]
    })
  });
  
  return true;
}

// 放弃任务
export async function unclaimTask(issueNumber) {
  if (!isLoggedIn()) {
    throw new Error('请先登录');
  }
  
  const user = getUser();
  
  // 1. 添加评论
  await fetch(`${API_BASE}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      body: `👋 **放弃任务**\n\n@${user.login} 放弃了这个任务，任务重新开放。`
    })
  });
  
  // 2. 更新标签：移除"进行中"，添加"待领"
  await updateTaskLabels(issueNumber, ['进行中'], ['待领']);
  
  // 3. 取消 Assign
  await fetch(`${API_BASE}/issues/${issueNumber}/assignees`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assignees: [user.login]
    })
  });
  
  return true;
}

// 完成任务
export async function completeTask(issueNumber) {
  if (!isLoggedIn()) {
    throw new Error('请先登录');
  }
  
  const user = getUser();
  
  // 1. 添加评论
  await fetch(`${API_BASE}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      body: `✅ **完成任务**\n\n@${user.login} 标记任务为已完成。`
    })
  });
  
  // 2. 更新标签
  await updateTaskLabels(issueNumber, ['进行中', '待领'], ['已完成']);
  
  return true;
}

// 更新任务标签
async function updateTaskLabels(issueNumber, removeLabels, addLabels) {
  // 获取当前标签
  const issueResponse = await fetch(`${API_BASE}/issues/${issueNumber}`, {
    headers: getAuthHeaders()
  });
  
  if (!issueResponse.ok) {
    throw new Error('获取任务信息失败');
  }
  
  const issue = await issueResponse.json();
  const currentLabels = issue.labels.map(l => l.name);
  
  // 计算新标签
  const newLabels = currentLabels
    .filter(label => !removeLabels.includes(label))
    .concat(addLabels.filter(label => !currentLabels.includes(label)));
  
  // 更新标签
  const updateResponse = await fetch(`${API_BASE}/issues/${issueNumber}/labels`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      labels: newLabels
    })
  });
  
  if (!updateResponse.ok) {
    const error = await updateResponse.json();
    throw new Error(error.message || '更新标签失败');
  }
  
  return true;
}

// 检查当前用户是否是任务的 assignee
export function isTaskAssignee(issue) {
  if (!isLoggedIn()) return false;
  const user = getUser();
  return issue.assignees && issue.assignees.some(a => a.login === user.login);
}

// 获取任务状态
export function getTaskStatus(issue) {
  const labels = issue.labels.map(l => l.name);
  if (labels.includes('已完成')) return 'completed';
  if (labels.includes('进行中')) return 'in-progress';
  return 'open';
}

// 渲染任务操作按钮
export function renderTaskActions(issue) {
  if (!isLoggedIn()) {
    return `<button class="btn-action btn-disabled" disabled>登录后领取</button>`;
  }
  
  const status = getTaskStatus(issue);
  const isAssignee = isTaskAssignee(issue);
  
  if (status === 'completed') {
    return `<span class="status-badge completed">✅ 已完成</span>`;
  }
  
  if (status === 'in-progress') {
    if (isAssignee) {
      return `
        <button class="btn-action btn-complete" onclick="handleCompleteTask(${issue.number}, event)">✅ 完成</button>
        <button class="btn-action btn-unclaim" onclick="handleUnclaimTask(${issue.number}, event)">👋 放弃</button>
      `;
    } else {
      const assignee = issue.assignees[0]?.login || '未知';
      return `<span class="status-badge in-progress">🔄 ${assignee} 进行中</span>`;
    }
  }
  
  // open status
  return `<button class="btn-action btn-claim" onclick="handleClaimTask(${issue.number}, event)">🙋 领取</button>`;
}
