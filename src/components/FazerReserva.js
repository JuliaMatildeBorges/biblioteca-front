import { Menu } from "./Menu";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getUsuarioAtual } from "../services/api";
import {
  CalendarCheck,
  Clock,
  Loader2,
  CheckCircle2,
  MapPin,
  Users,
} from "lucide-react";

// Limite de alunos por tipo de espaço — computadores comportam menos
// alunos por estação que uma sala de estudo em grupo.
const LIMITE_ALUNOS_POR_TIPO = {
  COMPUTADOR: 2,
  SALA: 5,
};
const LIMITE_PADRAO = 5;

export function FazerReserva() {
  const navigate = useNavigate();
  const usuario = getUsuarioAtual();
  const hoje = new Date().toISOString().slice(0, 10);

  const [aba, setAba] = useState("reserva");
  const [espacos, setEspacos] = useState([]);
  const [horariosVagos, setHorariosVagos] = useState([]);
  const [carregandoEspacos, setCarregandoEspacos] = useState(true);
  const [carregandoVagos, setCarregandoVagos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [dataBusca, setDataBusca] = useState(hoje);
  const [form, setForm] = useState({
    espacoId: "",
    curso: "",
    quantidadeAlunos: 1,
    data: hoje,
    inicio: "08:00",
    fim: "09:00",
  });

  const espacoSelecionado = useMemo(
    () => espacos.find((espaco) => String(espaco.id) === String(form.espacoId)),
    [espacos, form.espacoId]
  );

  const limiteAlunos = espacoSelecionado
    ? LIMITE_ALUNOS_POR_TIPO[espacoSelecionado.tipo] ?? LIMITE_PADRAO
    : LIMITE_PADRAO;

  const carregarEspacos = useCallback(async () => {
    setCarregandoEspacos(true);
    setMensagemErro("");
    try {
      const dados = await api.get("/espacos");
      const lista = Array.isArray(dados) ? dados : [];
      setEspacos(lista);
      if (lista.length > 0) {
        setForm((atual) => ({ ...atual, espacoId: lista[0].id }));
      }
    } catch (error) {
      setMensagemErro(error.message);
    } finally {
      setCarregandoEspacos(false);
    }
  }, []);

  const carregarHorariosVagos = useCallback(async () => {
    setCarregandoVagos(true);
    setMensagemErro("");
    try {
      const dados = await api.get(`/reservas/horarios-vagos?data=${dataBusca}`);
      setHorariosVagos(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setMensagemErro(error.message);
    } finally {
      setCarregandoVagos(false);
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

  // Se o usuário trocar para um espaço com limite menor de alunos
  // (ex: de uma sala para um computador), ajusta a quantidade automaticamente
  // em vez de deixar o formulário num estado inválido sem avisar.
  useEffect(() => {
    setForm((atual) => {
      if (Number(atual.quantidadeAlunos) > limiteAlunos) {
        return { ...atual, quantidadeAlunos: limiteAlunos };
      }
      return atual;
    });
  }, [limiteAlunos]);

  function alterarCampo(event) {
    const { name, value } = event.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  function validarFormulario() {
    if (!form.espacoId) return "Selecione um espaço.";
    if (!form.curso.trim()) return "Informe o curso.";

    const quantidade = Number(form.quantidadeAlunos);
    if (!quantidade || quantidade < 1) {
      return "A quantidade de alunos deve ser de ao menos 1.";
    }
    if (quantidade > limiteAlunos) {
      return `Este espaço aceita no máximo ${limiteAlunos} aluno(s).`;
    }

    if (!form.data || !form.inicio || !form.fim) {
      return "Preencha a data e os horários de início e fim.";
    }
    if (form.fim <= form.inicio) {
      return "O horário de fim deve ser depois do horário de início.";
    }

    return "";
  }

  async function reservar(event) {
    event.preventDefault();
    setMensagemErro("");
    setMensagemSucesso("");

    const erroValidacao = validarFormulario();
    if (erroValidacao) {
      setMensagemErro(erroValidacao);
      return;
    }

    setEnviando(true);
    try {
      await api.post("/reservas", {
        usuarioId: usuario.id,
        espacoId: Number(form.espacoId),
        curso: form.curso.trim(),
        quantidadeAlunos: Number(form.quantidadeAlunos),
        inicio: `${form.data}T${form.inicio}:00`,
        fim: `${form.data}T${form.fim}:00`,
      });

      setMensagemSucesso("Reserva criada com sucesso.");
      await carregarHorariosVagos();
    } catch (error) {
      setMensagemErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  function selecionarHorarioVago(horario) {
    setAba("reserva");
    setMensagemErro("");
    setMensagemSucesso("");
    setForm((atual) => ({
      ...atual,
      espacoId: horario.espacoId,
      data: horario.inicio.slice(0, 10),
      inicio: horario.inicio.slice(11, 16),
      fim: horario.fim.slice(11, 16),
    }));
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Menu />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Reservas
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Reservar espaço
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Computadores aceitam até {LIMITE_ALUNOS_POR_TIPO.COMPUTADOR} alunos;
            salas aceitam até {LIMITE_ALUNOS_POR_TIPO.SALA} alunos.
          </p>
        </div>

        {/* Abas */}
        <div className="inline-flex bg-slate-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setAba("reserva")}
            className={[
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              aba === "reserva"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            Nova reserva
          </button>
          <button
            onClick={() => setAba("vagos")}
            className={[
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              aba === "vagos"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            Horários vagos
          </button>
        </div>

        {mensagemErro && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {mensagemErro}
          </div>
        )}
        {mensagemSucesso && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {mensagemSucesso}
          </div>
        )}

        {aba === "reserva" && (
          <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
            {carregandoEspacos ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-sm">Carregando espaços disponíveis...</p>
              </div>
            ) : espacos.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">
                Nenhum espaço disponível para reserva no momento.
              </p>
            ) : (
              <form onSubmit={reservar} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Campo label="Espaço" obrigatorio>
                    <select
                      name="espacoId"
                      value={form.espacoId}
                      onChange={alterarCampo}
                      className={inputClasse()}
                      required
                    >
                      {espacos.map((espaco) => (
                        <option key={espaco.id} value={espaco.id}>
                          {espaco.nome} - {espaco.tipo}
                        </option>
                      ))}
                    </select>
                  </Campo>

                  <Campo label="Curso" obrigatorio>
                    <input
                      name="curso"
                      value={form.curso}
                      onChange={alterarCampo}
                      placeholder="Ex: Técnico em Informática"
                      className={inputClasse()}
                      required
                    />
                  </Campo>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Campo label="Data" obrigatorio>
                    <input
                      name="data"
                      type="date"
                      value={form.data}
                      onChange={alterarCampo}
                      min={hoje}
                      className={inputClasse()}
                      required
                    />
                  </Campo>
                  <Campo label="Início" obrigatorio>
                    <input
                      name="inicio"
                      type="time"
                      value={form.inicio}
                      onChange={alterarCampo}
                      className={inputClasse()}
                      required
                    />
                  </Campo>
                  <Campo label="Fim" obrigatorio>
                    <input
                      name="fim"
                      type="time"
                      value={form.fim}
                      onChange={alterarCampo}
                      className={inputClasse()}
                      required
                    />
                  </Campo>
                </div>

                <Campo
                  label="Quantidade de alunos"
                  obrigatorio
                  dica={`Máximo de ${limiteAlunos} aluno(s) para este espaço`}
                >
                  <input
                    name="quantidadeAlunos"
                    type="number"
                    min="1"
                    max={limiteAlunos}
                    value={form.quantidadeAlunos}
                    onChange={alterarCampo}
                    className={inputClasse()}
                    required
                  />
                </Campo>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4" />
                      Confirmar reserva
                    </>
                  )}
                </button>
              </form>
            )}
          </section>
        )}

        {aba === "vagos" && (
          <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Data
                </label>
                <input
                  type="date"
                  value={dataBusca}
                  onChange={(event) => setDataBusca(event.target.value)}
                  className={inputClasse()}
                />
              </div>
              <button
                type="button"
                onClick={carregarHorariosVagos}
                disabled={carregandoVagos}
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-medium text-sm px-4 py-2.5 rounded-lg transition-colors shrink-0"
              >
                {carregandoVagos ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                Atualizar
              </button>
            </div>

            {carregandoVagos ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-sm">Buscando horários vagos...</p>
              </div>
            ) : horariosVagos.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">
                Nenhum horário vago encontrado para esta data.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {horariosVagos.map((horario, index) => (
                  <button
                    key={`${horario.espacoId}-${horario.inicio}-${index}`}
                    type="button"
                    onClick={() => selecionarHorarioVago(horario)}
                    className="flex flex-col items-start gap-1 text-left border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl px-4 py-3.5 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-medium text-slate-900 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {horario.espacoNome}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      {horario.inicio.slice(11, 16)} às {horario.fim.slice(11, 16)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function Campo({ label, obrigatorio, dica, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {obrigatorio && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {dica && (
        <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {dica}
        </p>
      )}
    </div>
  );
}

function inputClasse() {
  return "w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-shadow";
}