function normalize(base: string) {
  // убираем слеш в конце
  return base.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  let env: string | undefined;
  try {
    env = import.meta?.env?.VITE_SERVER_URL as string | undefined;
  } catch {
    // в тестах import.meta недоступен
    env = undefined;
  }

  // dev/prod без VITE_SERVER_URL
  if (!env) {
    return '/api';
  }

  const cleaned = normalize(env);
  // добавляем или убираем /api
  return /\/api$/.test(cleaned) ? cleaned : `${cleaned}/api`;
}
export const getServerUrl = getApiBaseUrl;

// для внешних ссылок s3, без /api
export function getPublicBaseUrl(): string {
  let env: string | undefined;
  try {
    env = (import.meta?.env?.VITE_SERVER_URL as string | undefined)?.trim();
  } catch {
    // в тестах import.meta недоступен
    env = undefined;
  }
  if (env) {
    const cleaned = normalize(env).replace(/\/api$/, '');
    return cleaned;
  }
  return `${window.location.protocol}//${window.location.host}`;
}
