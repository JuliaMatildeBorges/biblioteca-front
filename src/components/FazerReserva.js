import { Menu } from "./Menu";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getUsuarioAtual } from "../services/api";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DoorOpen,
  Loader2,
  Monitor,
  Users,
} from "lucide-react";

const LIMITE_ALUNOS_POR_TIPO = {
  COMPUTADOR: 2,
  SALA: 5,
};
const LIMITE_PADRAO = 5;
const DIAS_VISIVEIS = 14;

function formatarDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function criarDataLocal(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function adicionarDias(data, dias) {
  const proxima = new Date(data);
  proxima.setDate(proxima.getDate() + dias);
  return proxima;
}

function mesmoDia(dataA, dataB) {
  return formatarDataISO(dataA) === formatarDataISO(dataB);
}

function formatarDiaSemana(data) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(data)
    .replace(".", "");
}

function formatarMesAno(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(data);
}

function formatarDataCompleta(iso) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(criarDataLocal(iso));
}

function formatarHorario(dataHora) {
  return dataHora.slice(11, 16);
}

function agruparPorHorario(horarios) {
  const grupos = new Map();

  horarios.forEach((horario) => {
    const chave = `${horario.inicio}|${horario.fim}`;
    const atual = grupos.get(chave) ?? {
      inicio: horario.inicio,
      fim: horario.fim,
      espacos: [],
    };
    atual.espacos.push(horario);
    grupos.set(chave, atual);
  });

  return Array.from(grupos.values()).sort((a, b) =>
    a.inicio.localeCompare(b.inicio)
  );
}

export function FazerReserva() {
  const navigate = useNavigate();
  const usuario = useMemo(() => getUsuarioAtual(), []);
  const hojeData = useMemo(() => new Date(), []);
  const hoje = useMemo(() => formatarDataISO(hojeData), [hojeData]);

  const [inicioCalendario, setInicioCalendario] = useState(hoje);
  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [duracaoMinutos, setDuracaoMinutos] = useState(60);
  const [horariosVagos, setHorariosVagos] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [espacoSelecionadoId, setEspacoSelecionadoId] = useState("");
  const [curso, setCurso] = useState("");
  const [quantidadeAlunos, setQuantidadeAlunos] = useState(1);
  const [carregandoVagos, setCarregandoVagos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const diasCalendario = useMemo(() => {
    const inicio = criarDataLocal(inicioCalendario);
    return Array.from({ length: DIAS_VISIVEIS }, (_, indice) =>
      adicionarDias(inicio, indice)
    );
  }, [inicioCalendario]);

  const horariosAgrupados = useMemo(
    () => agruparPorHorario(horariosVagos),
    [horariosVagos]
  );

  const espacosDoHorario = useMemo(
    () => horarioSelecionado?.espacos ?? [],
    [horarioSelecionado]
  );

  const espacoSelecionado = useMemo(
    () =>
      espacosDoHorario.find(
        (espaco) => String(espaco.espacoId) === String(espacoSelecionadoId)
      ),
    [espacoSelecionadoId, espacosDoHorario]
  );

  const limiteAlunos = espacoSelecionado
    ? LIMITE_ALUNOS_POR_TIPO[espacoSelecionado.espacoTipo] ?? LIMITE_PADRAO
    : LIMITE_PADRAO;

  const podeVoltarCalendario = inicioCalendario > hoje;

  const carregarHorariosVagos = useCallback(async () => {
    setCarregandoVagos(true);
    setMensagemErro("");
    setMensagemSucesso("");
    try {
      const dados = await api.get(
        `/reservas/horarios-vagos?data=${dataSelecionada}&duracaoMinutos=${duracaoMinutos}`
      );
      const agora = new Date();
      const lista = (Array.isArray(dados) ? dados : []).filter(
        (horario) => new Date(horario.inicio) > agora
      );
      setHorariosVagos(lista);
    } catch (error) {
      setMensagemErro(error.message);
      setHorariosVagos([]);
    } finally {
      setCarregandoVagos(false);
    }
  }, [dataSelecionada, duracaoMinutos]);

  useEffect(() => {
    if (!usuario) {
      navigate("/login");
      return;
    }
    carregarHorariosVagos();
  }, [carregarHorariosVagos, navigate, usuario]);

  useEffect(() => {
    setHorarioSelecionado(null);
    setEspacoSelecionadoId("");
  }, [dataSelecionada, duracaoMinutos]);

  useEffect(() => {
    if (Number(quantidadeAlunos) > limiteAlunos) {
      setQuantidadeAlunos(limiteAlunos);
    }
  }, [limiteAlunos, quantidadeAlunos]);

  function selecionarDia(data) {
    const iso = formatarDataISO(data);
    if (iso < hoje) return;
    setDataSelecionada(iso);
  }

  function moverCalendario(dias) {
    const novoInicio = adicionarDias(criarDataLocal(inicioCalendario), dias);
    const iso = formatarDataISO(novoInicio);
    setInicioCalendario(iso < hoje ? hoje : iso);
  }

  function selecionarHorario(horario) {
    setHorarioSelecionado(horario);
    setEspacoSelecionadoId("");
    setMensagemErro("");
    setMensagemSucesso("");
  }

  function selecionarEspaco(espaco) {
    setEspacoSelecionadoId(espaco.espacoId);
    setMensagemErro("");
    setMensagemSucesso("");
  }

  function validarReserva() {
    if (!horarioSelecionado) return "Selecione um horário disponível.";
    if (!espacoSelecionado) return "Selecione uma sala ou computador.";
    if (!curso.trim()) return "Informe o curso.";

    const quantidade = Number(quantidadeAlunos);
    if (!quantidade || quantidade < 1) {
      return "A quantidade de alunos deve ser de ao menos 1.";
    }
    if (quantidade > limiteAlunos) {
      return `Este espaço aceita no máximo ${limiteAlunos} aluno(s).`;
    }

    return "";
  }

  async function reservar(event) {
    event.preventDefault();
    setMensagemErro("");
    setMensagemSucesso("");

    const erroValidacao = validarReserva();
    if (erroValidacao) {
      setMensagemErro(erroValidacao);
      return;
    }

    setEnviando(true);
    try {
      await api.post("/reservas", {
        usuarioId: usuario.id,
        espacoId: Number(espacoSelecionado.espacoId),
        curso: curso.trim(),
        quantidadeAlunos: Number(quantidadeAlunos),
        inicio: horarioSelecionado.inicio,
        fim: horarioSelecionado.fim,
      });

      setMensagemSucesso("Reserva criada com sucesso.");
      setHorarioSelecionado(null);
      setEspacoSelecionadoId("");
      setCurso("");
      setQuantidadeAlunos(1);
      await carregarHorariosVagos();
    } catch (error) {
      setMensagemErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="reserva-page">
      <Menu />

      <main className="reserva-shell">
        <header className="reserva-header">
          <div>
            <p className="eyebrow">Nova reserva</p>
            <h1>Escolha dia, horário e espaço</h1>
            <p className="muted">
              Primeiro selecione um dia no calendário. Depois escolha a duração,
              veja os horários com vagas e clique para visualizar salas e
              computadores disponíveis.
            </p>
          </div>
        </header>

        {mensagemErro && <div className="alert">{mensagemErro}</div>}
        {mensagemSucesso && (
          <div className="success reserva-feedback">
            <CheckCircle2 size={18} />
            {mensagemSucesso}
          </div>
        )}

        <section className="reserva-flow">
          <div className="reserva-main">
            <section className="reserva-panel">
              <div className="section-title">
                <span className="step-badge">1</span>
                <div>
                  <h2>Selecione o dia</h2>
                  <p>Visualização de 2 semanas do calendário.</p>
                </div>
              </div>

              <div className="calendar-toolbar">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => moverCalendario(-DIAS_VISIVEIS)}
                  disabled={!podeVoltarCalendario}
                  aria-label="Voltar duas semanas"
                >
                  <ChevronLeft size={18} />
                </button>
                <strong>{formatarMesAno(criarDataLocal(inicioCalendario))}</strong>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => moverCalendario(DIAS_VISIVEIS)}
                  aria-label="Avançar duas semanas"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="two-week-calendar" aria-label="Calendário">
                {diasCalendario.map((data) => {
                  const iso = formatarDataISO(data);
                  const selecionado = iso === dataSelecionada;
                  const passado = iso < hoje;
                  const atual = mesmoDia(data, hojeData);

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={passado}
                      onClick={() => selecionarDia(data)}
                      className={[
                        "calendar-day",
                        selecionado ? "selected" : "",
                        atual ? "today" : "",
                      ].join(" ")}
                    >
                      <span>{formatarDiaSemana(data)}</span>
                      <strong>{data.getDate()}</strong>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="reserva-panel">
              <div className="section-title">
                <span className="step-badge">2</span>
                <div>
                  <h2>Escolha a duração</h2>
                  <p>Você pode reservar por 30 minutos ou 1 hora.</p>
                </div>
              </div>

              <div className="duration-toggle" role="group" aria-label="Duração">
                {[30, 60].map((duracao) => (
                  <button
                    key={duracao}
                    type="button"
                    className={duracaoMinutos === duracao ? "active" : ""}
                    onClick={() => setDuracaoMinutos(duracao)}
                  >
                    <Clock size={16} />
                    {duracao === 30 ? "30 min" : "1 hora"}
                  </button>
                ))}
              </div>
            </section>

            <section className="reserva-panel">
              <div className="section-title">
                <span className="step-badge">3</span>
                <div>
                  <h2>Horários com vagas</h2>
                  <p>{formatarDataCompleta(dataSelecionada)}</p>
                </div>
              </div>

              {carregandoVagos ? (
                <div className="loading-state">
                  <Loader2 className="spin" size={24} />
                  <p>Buscando horários disponíveis...</p>
                </div>
              ) : horariosAgrupados.length === 0 ? (
                <div className="empty-state">
                  <CalendarDays size={24} />
                  <p>Nenhuma vaga encontrada para este dia e duração.</p>
                </div>
              ) : (
                <div className="time-slots">
                  {horariosAgrupados.map((horario) => {
                    const selecionado =
                      horarioSelecionado?.inicio === horario.inicio &&
                      horarioSelecionado?.fim === horario.fim;

                    return (
                      <button
                        key={`${horario.inicio}-${horario.fim}`}
                        type="button"
                        onClick={() => selecionarHorario(horario)}
                        className={selecionado ? "selected" : ""}
                      >
                        <strong>
                          {formatarHorario(horario.inicio)} às{" "}
                          {formatarHorario(horario.fim)}
                        </strong>
                        <span>
                          {horario.espacos.length} vaga
                          {horario.espacos.length > 1 ? "s" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="reserva-side">
            <form className="reserva-panel reserva-summary" onSubmit={reservar}>
              <div className="section-title">
                <span className="step-badge">4</span>
                <div>
                  <h2>Salas e computadores</h2>
                  <p>
                    Clique em um horário para ver os espaços livres nesse
                    período.
                  </p>
                </div>
              </div>

              {!horarioSelecionado ? (
                <div className="empty-state compact">
                  <Clock size={22} />
                  <p>Escolha um horário para continuar.</p>
                </div>
              ) : (
                <>
                  <div className="selected-time">
                    <Clock size={18} />
                    <span>
                      {formatarHorario(horarioSelecionado.inicio)} às{" "}
                      {formatarHorario(horarioSelecionado.fim)}
                    </span>
                  </div>

                  <div className="space-options">
                    {espacosDoHorario.map((espaco) => {
                      const selecionado =
                        String(espacoSelecionadoId) === String(espaco.espacoId);
                      const Icone =
                        espaco.espacoTipo === "COMPUTADOR" ? Monitor : DoorOpen;

                      return (
                        <button
                          key={espaco.espacoId}
                          type="button"
                          onClick={() => selecionarEspaco(espaco)}
                          className={selecionado ? "selected" : ""}
                        >
                          <Icone size={18} />
                          <span>
                            <strong>{espaco.espacoNome}</strong>
                            <small>{espaco.espacoTipo}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="reservation-details">
                <label>
                  Curso
                  <input
                    value={curso}
                    onChange={(event) => setCurso(event.target.value)}
                    placeholder="Ex: Técnico em Informática"
                    required
                  />
                </label>

                <label>
                  Quantidade de alunos
                  <input
                    type="number"
                    min="1"
                    max={limiteAlunos}
                    value={quantidadeAlunos}
                    onChange={(event) => setQuantidadeAlunos(event.target.value)}
                    required
                  />
                  <span className="field-hint">
                    <Users size={14} />
                    Máximo de {limiteAlunos} aluno(s) para este espaço.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={enviando || !horarioSelecionado || !espacoSelecionado}
                className="button primary full"
              >
                {enviando ? (
                  <>
                    <Loader2 className="spin" size={18} />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Confirmar reserva
                  </>
                )}
              </button>
            </form>
          </aside>
        </section>
      </main>
    </div>
  );
}
