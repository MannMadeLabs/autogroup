export function getToken(): string | null {
  return localStorage.getItem("apex_token");
}

export function setToken(token: string): void {
  localStorage.setItem("apex_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("apex_token");
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
