import { useCallback, useEffect, useState } from "react";
import { Menu } from "./Menu";
import { useNavigate } from "react-router-dom";
import { api, getUsuarioAtual } from "../services/api";

export function Inicio() {
  const navigate = useNavigate();
  const usuario = getUsuarioAtual();
  const [reservas, setReservas] = useState([]);
  const [mensagem, setMensagem] = useState("");

  const carregarReservas = useCallback(async () => {
    try {
      const dados = await api.get(`/reservas/usuario/${usuario.id}`);
      setReservas(dados);
    } catch (error) {
      setMensagem(error.message);
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario) {
      navigate("/login");
      return;
    }
    carregarReservas();
  }, [carregarReservas, navigate, usuario]);

  async function atualizarStatus(id, acao) {
    try {
      await api.patch(`/reservas/${id}/${acao}`);
      await carregarReservas();
    } catch (error) {
      setMensagem(error.message);
    }
  }

  return (
    <div>
      <Menu />

      <main className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Área do usuário</p>
            <h1>Minhas reservas</h1>
            <p className="muted">Acompanhe seus horários e registre check-in ou checkout.</p>
          </div>
          <button onClick={() => navigate("/fazer-reserva")} className="button primary">
            Nova reserva
          </button>
        </div>

        {mensagem && <p className="alert">{mensagem}</p>}

        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Espaço</th>
                <th>Curso</th>
                <th>Alunos</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td>{reserva.espacoNome}</td>
                  <td>{reserva.curso}</td>
                  <td>{reserva.quantidadeAlunos}</td>
                  <td>{formatarData(reserva.inicio)}</td>
                  <td>{formatarData(reserva.fim)}</td>
                  <td><span className="badge">{reserva.status}</span></td>
                  <td className="row-actions">
                    <button className="button compact" onClick={() => atualizarStatus(reserva.id, "checkin")}>
                      Check-in
                    </button>
                    <button className="button compact secondary" onClick={() => atualizarStatus(reserva.id, "checkout")}>
                      Checkout
                    </button>
                  </td>
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
