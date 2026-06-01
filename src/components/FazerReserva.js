// FazerReserva.js
import { Menu } from "./Menu";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getUsuarioAtual } from "../services/api";

export function FazerReserva() {
  const navigate = useNavigate();
  const usuario = getUsuarioAtual();
  const hoje = new Date().toISOString().slice(0, 10);
  const [aba, setAba] = useState("reserva");
  const [espacos, setEspacos] = useState([]);
  const [horariosVagos, setHorariosVagos] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [dataBusca, setDataBusca] = useState(hoje);
  const [form, setForm] = useState({
    espacoId: "",
    curso: "",
    quantidadeAlunos: 1,
    data: hoje,
    inicio: "08:00",
    fim: "09:00",
  });

  const carregarEspacos = useCallback(async () => {
    try {
      const dados = await api.get("/espacos");
      setEspacos(dados);
      if (dados.length > 0) setForm((atual) => ({ ...atual, espacoId: dados[0].id }));
    } catch (error) {
      setMensagem(error.message);
    }
  }, []);

  const carregarHorariosVagos = useCallback(async () => {
    try {
      const dados = await api.get(`/reservas/horarios-vagos?data=${dataBusca}`);
      setHorariosVagos(dados);
    } catch (error) {
      setMensagem(error.message);
    }
  }, [dataBusca]);

  useEffect(() => {
    if (!usuario) {
      navigate("/login");
      return;
    }
    carregarEspacos();
  }, [carregarEspacos, navigate, usuario]);

  useEffect(() => {
    if (aba === "vagos") carregarHorariosVagos();
  }, [aba, carregarHorariosVagos]);

  function alterarCampo(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function reservar(event) {
    event.preventDefault();
    setMensagem("");

    try {
      await api.post("/reservas", {
        usuarioId: usuario.id,
        espacoId: Number(form.espacoId),
        curso: form.curso,
        quantidadeAlunos: Number(form.quantidadeAlunos),
        inicio: `${form.data}T${form.inicio}:00`,
        fim: `${form.data}T${form.fim}:00`,
      });

      setMensagem("Reserva criada com sucesso.");
      await carregarHorariosVagos();
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
            <p className="eyebrow">Reservas</p>
            <h1>Reservar espaço</h1>
            <p className="muted">Computadores aceitam até 2 alunos; salas aceitam até 5 alunos.</p>
          </div>
        </div>

        <div className="tabs">
          <button className={aba === "reserva" ? "active" : ""} onClick={() => setAba("reserva")}>
            Nova reserva
          </button>
          <button className={aba === "vagos" ? "active" : ""} onClick={() => setAba("vagos")}>
            Horários vagos
          </button>
        </div>

        {mensagem && <p className={mensagem.includes("sucesso") ? "success" : "alert"}>{mensagem}</p>}

        {aba === "reserva" && (
          <section className="panel">
            <form className="form" onSubmit={reservar}>
              <div className="form-grid">
                <label>
                  Espaço
                  <select name="espacoId" value={form.espacoId} onChange={alterarCampo} required>
                    {espacos.map((espaco) => (
                      <option key={espaco.id} value={espaco.id}>
                        {espaco.nome} - {espaco.tipo}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Curso
                  <input name="curso" value={form.curso} onChange={alterarCampo} required />
                </label>
              </div>

              <div className="form-grid three">
                <label>
                  Data
                  <input name="data" type="date" value={form.data} onChange={alterarCampo} required />
                </label>
                <label>
                  Início
                  <input name="inicio" type="time" value={form.inicio} onChange={alterarCampo} required />
                </label>
                <label>
                  Fim
                  <input name="fim" type="time" value={form.fim} onChange={alterarCampo} required />
                </label>
              </div>

              <label>
                Quantidade de alunos
                <input
                  name="quantidadeAlunos"
                  type="number"
                  min="1"
                  max="5"
                  value={form.quantidadeAlunos}
                  onChange={alterarCampo}
                  required
                />
              </label>

              <button className="button primary" type="submit">Confirmar reserva</button>
            </form>
          </section>
        )}

        {aba === "vagos" && (
          <section className="panel">
            <div className="toolbar">
              <label>
                Data
                <input type="date" value={dataBusca} onChange={(event) => setDataBusca(event.target.value)} />
              </label>
              <button className="button secondary" onClick={carregarHorariosVagos}>Atualizar</button>
            </div>

            <div className="slots">
              {horariosVagos.map((horario, index) => (
                <button
                  key={`${horario.espacoId}-${horario.inicio}-${index}`}
                  className="slot"
                  onClick={() => {
                    setAba("reserva");
                    setForm({
                      ...form,
                      espacoId: horario.espacoId,
                      data: horario.inicio.slice(0, 10),
                      inicio: horario.inicio.slice(11, 16),
                      fim: horario.fim.slice(11, 16),
                    });
                  }}
                >
                  <strong>{horario.espacoNome}</strong>
                  <span>{horario.inicio.slice(11, 16)} às {horario.fim.slice(11, 16)}</span>
                </button>
              ))}
              {horariosVagos.length === 0 && <p className="empty">Nenhum horário vago encontrado.</p>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
