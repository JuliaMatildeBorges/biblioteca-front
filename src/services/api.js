const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// Centraliza chamadas HTTP para trocar a URL pelo .env sem alterar os componentes.
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.mensagem || "Não foi possível concluir a operação.");
  }

  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

export const api = {
  url: API_URL,
  get: (path) => request(path),
  post: (path, data) => request(path, { method: "POST", body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) }),
  patch: (path) => request(path, { method: "PATCH" }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export function getUsuarioAtual() {
  const usuario = localStorage.getItem("usuarioAtual");
  return usuario ? JSON.parse(usuario) : null;
}

export function setUsuarioAtual(usuario) {
  localStorage.setItem("usuarioAtual", JSON.stringify(usuario));
}
