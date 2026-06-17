// Cadastro.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "./Menu";
import { api, setUsuarioAtual } from "../services/api";

export function Cadastro() {
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    cpf: "",
    instituicao: "SENAI",
    tipo: "ALUNO",
  });

  function alterarCampo(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function cadastrar(event) {
    event.preventDefault();
    setMensagem("");

    try {
      const response = await fetch(`${API_URL}/usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),

      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.mensagem || "Não foi possível concluir a operação.");
      }
      const usuario = await response.json();
      setUsuarioAtual(usuario);
      navigate("/inicio");
    } catch (error) {
      setMensagem(error.message);
    }

  }

  return (
    <div>
      <Menu />

      <main className="page narrow">
        <section className="panel">
          <h1>Cadastro</h1>

          <p className="muted">
            Preencha as informações abaixo para criar sua conta.
          </p>

          <form className="form" onSubmit={cadastrar}>
            <label>
              Nome completo
              <input
                name="nome"
                type="text"
                value={form.nome}
                onChange={alterarCampo}
                placeholder="Digite seu nome"
                required
              />
            </label>

            <div className="form-grid">
              <label>
                CPF
                <input
                  name="cpf"
                  type="text"
                  value={form.cpf}
                  onChange={alterarCampo}
                  placeholder="000.000.000-00"
                  required
                />
              </label>
              <label>
                Telefone
                <input
                  name="telefone"
                  type="tel"
                  value={form.telefone}
                  onChange={alterarCampo}
                  placeholder="(00) 00000-0000"
                  required
                />
              </label>
            </div>

            <label>
              E-mail
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={alterarCampo}
                placeholder="Digite seu e-mail"
                required
              />
            </label>

            <label>
              Senha
              <input
                name="senha"
                type="password"
                value={form.senha}
                onChange={alterarCampo}
                placeholder="Digite sua senha"
                required
              />
            </label>

            <div className="form-grid">
              <label>
                Instituição
                <select name="instituicao" value={form.instituicao} onChange={alterarCampo}>
                  <option value="SENAI">SENAI</option>
                  <option value="SESI">SESI</option>
                </select>
              </label>

              <label>
                Tipo
                <select name="tipo" value={form.tipo} onChange={alterarCampo}>
                  <option value="ALUNO">Aluno</option>
                  <option value="COLABORADOR">Colaborador</option>
                  <option value="TERCEIROS">Terceiros</option>
                </select>
              </label>
            </div>

            {mensagem && <p className="alert">{mensagem}</p>}

            <button type="submit" className="button primary full">
              Cadastrar
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
