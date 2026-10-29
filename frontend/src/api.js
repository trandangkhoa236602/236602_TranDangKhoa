const configured = window.APP_CONFIG?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = configured.replace(/\/$/, '');

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
  } catch (_) {
    throw new Error('Không kết nối được Backend. Kiểm tra API URL hoặc trạng thái Backend.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}
