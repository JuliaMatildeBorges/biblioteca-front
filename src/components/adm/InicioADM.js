import { Menu } from "../Menu";
import { useEffect, useState } from "react";
import { api } from "../../services/api";

export function InicioADM() {
  const [reservas, setReservas] = useState([]);
  const [espacos, setEspacos] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [form, setForm] = useState({
    nome: "",
    tipo: "SALA",
    capacidade: 5,
    observacao: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [reservasDados, espacosDados] = await Promise.all([
        api.get("/reservas"),
        api.get("/espacos"),
      ]);
      setReservas(reservasDados);
      setEspacos(espacosDados);
    } catch (error) {
      setMensagem(error.message);
    }
  }

  function alterarCampo(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function salvarEspaco(event) {
    event.preventDefault();
    try {
      await api.post("/espacos", {
        ...form,
        capacidade: Number(form.capacidade),
      });
      setForm({ nome: "", tipo: "SALA", capacidade: 5, observacao: "" });
      await carregarDados();
      setMensagem("Espaço criado com sucesso.");
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function excluirEspaco(id) {
    try {
      await api.delete(`/espacos/${id}`);
      await carregarDados();
    } catch (error) {
      setMensagem(error.message);
    }
  }

  function baixarRelatorio() {
    const cabecalho = ["ID", "Usuário", "Email", "Espaço", "Tipo", "Curso", "Alunos", "Início", "Fim", "Status"];
    const linhas = reservas.map((reserva) => [
      reserva.id,
      reserva.usuarioNome,
      reserva.usuarioEmail,
      reserva.espacoNome,
      reserva.espacoTipo,
      reserva.curso,
      reserva.quantidadeAlunos,
      reserva.inicio,
      reserva.fim,
      reserva.status,
    ]);
    const csv = [cabecalho, ...linhas]
      .map((linha) => linha.map((valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`).join(";"))
      .join("\n");

    const arquivo = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-reservas.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Menu />
      <main className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Administração</p>
            <h1>Reservas e espaços</h1>
            <p className="muted">Visualize reservas, exporte relatórios e gerencie salas e computadores.</p>
          </div>
          <button className="button primary" onClick={baixarRelatorio}>Baixar relatório</button>
        </div>

        {mensagem && <p className={mensagem.includes("sucesso") ? "success" : "alert"}>{mensagem}</p>}

        <section className="dashboard-grid">
          <div className="panel">
            <h2>Novo espaço</h2>
            <form className="form" onSubmit={salvarEspaco}>
              <label>
                Nome
                <input name="nome" value={form.nome} onChange={alterarCampo} required />
              </label>
              <div className="form-grid">
                <label>
                  Tipo
                  <select name="tipo" value={form.tipo} onChange={alterarCampo}>
                    <option value="SALA">Sala</option>
                    <option value="COMPUTADOR">Computador</option>
                  </select>
                </label>
                <label>
                  Capacidade
                  <input name="capacidade" type="number" min="1" max="5" value={form.capacidade} onChange={alterarCampo} />
                </label>
              </div>
              <label>
                Observação
                <textarea name="observacao" value={form.observacao} onChange={alterarCampo} rows="3" />
              </label>
              <button className="button primary" type="submit">Criar espaço</button>
            </form>
          </div>

          <div className="panel">
            <h2>Salas e computadores</h2>
            <div className="resource-list">
              {espacos.map((espaco) => (
                <div key={espaco.id} className="resource-item">
                  <div>
                    <strong>{espaco.nome}</strong>
                    <span>{espaco.tipo} · {espaco.capacidade} alunos</span>
                  </div>
                  <button className="button compact danger" onClick={() => excluirEspaco(espaco.id)}>
                    Inativar
                  </button>
                </div>
              ))}
              {espacos.length === 0 && <p className="empty">Nenhum espaço cadastrado.</p>}
            </div>
          </div>
        </section>

        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Email</th>
                <th>Espaço</th>
                <th>Curso</th>
                <th>Alunos</th>
                <th>Início</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>{reserva.usuarioNome}</td>
                  <td>{reserva.usuarioEmail}</td>
                  <td>{reserva.espacoNome}</td>
                  <td>{reserva.curso}</td>
                  <td>{reserva.quantidadeAlunos}</td>
                  <td>{formatarData(reserva.inicio)}</td>
                  <td><span className="badge">{reserva.status}</span></td>
                </tr>
              ))}
              {reservas.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty">Nenhuma reserva encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

function formatarData(valor) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(valor));
}
