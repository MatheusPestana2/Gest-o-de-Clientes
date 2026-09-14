const API_URL = 'http://localhost:3001/api';

export async function loginApi(email: string, senha: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao realizar login.');
  }

  if (data.token) {
    localStorage.setItem('@CRM:token', data.token);
  }

  return data;
}

export function logout() {
  localStorage.removeItem('@CRM:token');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('@CRM:token');
}