const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Centraliza chamadas HTTP para trocar a URL pelo .env sem alterar os componentes.
async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    // Sessão expirada ou token inválido: desloga e redireciona para o login
    // em vez de deixar a tela tentar renderizar dados que nunca vão chegar.
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuarioAtual");
      window.location.href = "/login";
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const erro = await response.json().catch(() => null);
    // Nunca repassamos texto bruto de exceções/stack traces (ex: erros 500
    // de banco de dados) — apenas mensagens conhecidas vindas da API.
    const mensagem =
      typeof erro?.mensagem === "string"
        ? erro.mensagem
        : typeof erro?.message === "string"
        ? erro.message
        : "Não foi possível concluir a operação.";
    throw new Error(mensagem);
  }

  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

export const api = {
  url: API_URL,
  get: (path) => request(path),
  post: (path, data) => request(path, { method: "POST", body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) }),
  patch: (path, data) =>
    request(path, {
      method: "PATCH",
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export function getUsuarioAtual() {
  const usuario = localStorage.getItem("usuarioAtual");
  return usuario ? JSON.parse(usuario) : null;
}

export function setUsuarioAtual(usuario) {
  localStorage.setItem("usuarioAtual", JSON.stringify(usuario));
}