/**
 * Grassroots AI Proxy - Cloudflare Worker
 * 代理 Kimi Code API 请求，解决 CORS 问题
 */

const KIMI_API_URL = 'https://api.kimi.com/coding/v1/chat/completions';

// 允许的来源域名（你的网站）
const ALLOWED_ORIGINS = [
  'https://grassroots-project.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    // 只允许 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // 检查来源
    const origin = request.headers.get('Origin');
    if (!isAllowedOrigin(origin)) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      // 获取请求体
      const body = await request.json();
      
      // 从请求头获取 API Key
      const apiKey = request.headers.get('X-API-Key');
      if (!apiKey) {
        return jsonResponse({ error: 'Missing API Key' }, 400, origin);
      }

      // 转发请求到 Kimi API
      const response = await fetch(KIMI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      // 获取响应
      const data = await response.json();

      // 返回响应（带 CORS 头）
      return jsonResponse(data, response.status, origin);

    } catch (error) {
      return jsonResponse({ error: error.message }, 500, origin);
    }
  },
};

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

function handleCORS(request) {
  const origin = request.headers.get('Origin');
  if (!isAllowedOrigin(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
    },
  });
}
