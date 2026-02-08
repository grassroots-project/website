// GitHub Auth Module (PAT-based)
// 用户输入 Personal Access Token 进行认证

const AUTH_STORAGE_KEY = 'grassroots_github_token';
const USER_STORAGE_KEY = 'grassroots_github_user';

// 获取存储的 token
export function getToken() {
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

// 获取存储的用户信息
export function getUser() {
  const userJson = localStorage.getItem(USER_STORAGE_KEY);
  return userJson ? JSON.parse(userJson) : null;
}

// 检查是否已登录
export function isLoggedIn() {
  return !!getToken() && !!getUser();
}

// 验证 token 并获取用户信息
export async function validateToken(token) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Token 无效或已过期');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Token 验证失败:', error);
    throw error;
  }
}

// 登录（保存 token 和用户信息）
export async function login(token) {
  const user = await validateToken(token);
  localStorage.setItem(AUTH_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

// 登出
export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

// 获取带认证的 headers
export function getAuthHeaders() {
  const token = getToken();
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// 渲染登录状态 UI
export function renderAuthUI(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (isLoggedIn()) {
    const user = getUser();
    container.innerHTML = `
      <div class="auth-status logged-in">
        <img src="${user.avatar_url}" alt="${user.login}" class="avatar">
        <span class="username">${user.login}</span>
        <button onclick="handleLogout()" class="btn-logout">登出</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="auth-status logged-out">
        <button onclick="showLoginModal()" class="btn-login">🔑 登录 GitHub</button>
      </div>
    `;
  }
}

// 创建登录弹窗
export function createLoginModal() {
  // 如果已存在，先移除
  const existing = document.getElementById('login-modal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'login-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="hideLoginModal()">&times;</span>
      <h2>🔑 登录 GitHub</h2>
      <p>输入你的 Personal Access Token (PAT) 以领取任务。</p>
      
      <div class="token-guide">
        <h4>如何获取 Token？</h4>
        <ol>
          <li>打开 <a href="https://github.com/settings/tokens/new?description=Grassroots%20Tasks&scopes=public_repo" target="_blank">GitHub Token 页面</a></li>
          <li>勾选 <code>public_repo</code> 权限</li>
          <li>点击 "Generate token"</li>
          <li>复制 token 粘贴到下方</li>
        </ol>
      </div>
      
      <div class="token-input-group">
        <input type="password" id="token-input" placeholder="ghp_xxxxxxxxxxxx" />
        <button onclick="handleLogin()" class="btn-primary">登录</button>
      </div>
      
      <p class="token-note">
        ⚠️ Token 仅存储在你的浏览器本地，不会上传到任何服务器。
      </p>
      
      <div id="login-error" class="error-message"></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  return modal;
}

// 显示登录弹窗
window.showLoginModal = function() {
  let modal = document.getElementById('login-modal');
  if (!modal) {
    modal = createLoginModal();
  }
  modal.style.display = 'flex';
  document.getElementById('token-input').focus();
};

// 隐藏登录弹窗
window.hideLoginModal = function() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// 处理登录
window.handleLogin = async function() {
  const tokenInput = document.getElementById('token-input');
  const errorDiv = document.getElementById('login-error');
  const token = tokenInput.value.trim();
  
  if (!token) {
    errorDiv.textContent = '请输入 Token';
    return;
  }
  
  errorDiv.textContent = '';
  tokenInput.disabled = true;
  
  try {
    await login(token);
    hideLoginModal();
    renderAuthUI('auth-container');
    // 重新加载任务列表以显示领取按钮
    if (typeof loadTasks === 'function') {
      loadTasks();
    }
  } catch (error) {
    errorDiv.textContent = 'Token 无效，请检查后重试';
    tokenInput.disabled = false;
  }
};

// 处理登出
window.handleLogout = function() {
  logout();
  renderAuthUI('auth-container');
  if (typeof loadTasks === 'function') {
    loadTasks();
  }
};

// 点击弹窗外部关闭
window.addEventListener('click', (e) => {
  const modal = document.getElementById('login-modal');
  if (e.target === modal) {
    hideLoginModal();
  }
});

// 回车键登录
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const modal = document.getElementById('login-modal');
    if (modal && modal.style.display === 'flex') {
      handleLogin();
    }
  }
});
