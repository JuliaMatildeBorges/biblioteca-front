import { useCallback, useEffect, useState } from "react";
import { Menu } from "./Menu";
import { useNavigate } from "react-router-dom";
import { api, getUsuarioAtual } from "../services/api";
import {
  CalendarPlus,
  LogIn,
  LogOut,
  Loader2,
  CalendarX,
} from "lucide-react";

const STATUS_ESTILO = {
  PENDENTE: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMADA: "bg-blue-50 text-blue-700 border-blue-200",
  EM_ANDAMENTO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FINALIZADA: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELADA: "bg-red-50 text-red-700 border-red-200",
};

function estiloStatus(status) {
  return STATUS_ESTILO[status] || "bg-slate-100 text-slate-600 border-slate-200";
}

export function Inicio() {
  const navigate = useNavigate();
  const usuario = getUsuarioAtual();
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState("");
  const [acaoEmAndamento, setAcaoEmAndamento] = useState(null);

  const carregarReservas = useCallback(async () => {
    if (!usuario?.id) return;

    setCarregando(true);
    setMensagemErro("");
    try {
      const dados = await api.get(`/reservas/usuario/${usuario.id}`);
      setReservas(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setMensagemErro(error.message);
    } finally {
      setCarregando(false);
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
    setMensagemErro("");
    setAcaoEmAndamento(`${id}-${acao}`);
    try {
      await api.patch(`/reservas/${id}/${acao}`);
      await carregarReservas();
    } catch (error) {
      setMensagemErro(error.message);
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  // Evita renderizar a tabela antes do redirecionamento ao /login acontecer
  if (!usuario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Menu />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
              Área do usuário
            </p>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Minhas reservas
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Acompanhe seus horários e registre check-in ou checkout.
            </p>
          </div>

          <button
            onClick={() => navigate("/fazer-reserva")}
            className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors shrink-0"
          >
            <CalendarPlus className="w-4 h-4" />
            Nova reserva
          </button>
        </div>

        {mensagemErro && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {mensagemErro}
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-sm">Carregando reservas...</p>
            </div>
          ) : reservas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <CalendarX className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-slate-600 font-medium">Nenhuma reserva encontrada</p>
              <p className="text-slate-400 text-sm mt-1 max-w-sm">
                Quando você fizer uma reserva de sala ou computador, ela vai
                aparecer aqui.
              </p>
            </div>
          ) : (
            <>
              {/* Tabela (telas médias e grandes) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-slate-500">
                      <th className="px-6 py-3.5 font-medium">Espaço</th>
                      <th className="px-6 py-3.5 font-medium">Curso</th>
                      <th className="px-6 py-3.5 font-medium">Alunos</th>
                      <th className="px-6 py-3.5 font-medium">Início</th>
                      <th className="px-6 py-3.5 font-medium">Fim</th>
                      <th className="px-6 py-3.5 font-medium">Status</th>
                      <th className="px-6 py-3.5 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reservas.map((reserva) => (
                      <tr key={reserva.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-slate-900 font-medium">
                          {reserva.espacoNome}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{reserva.curso}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {reserva.quantidadeAlunos}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatarData(reserva.inicio)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatarData(reserva.fim)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${estiloStatus(
                              reserva.status
                            )}`}
                          >
                            {reserva.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <BotaoAcao
                              ativo={acaoEmAndamento === `${reserva.id}-checkin`}
                              onClick={() => atualizarStatus(reserva.id, "checkin")}
                              icone={<LogIn className="w-3.5 h-3.5" />}
                              label="Check-in"
                              variante="primario"
                            />
                            <BotaoAcao
                              ativo={acaoEmAndamento === `${reserva.id}-checkout`}
                              onClick={() => atualizarStatus(reserva.id, "checkout")}
                              icone={<LogOut className="w-3.5 h-3.5" />}
                              label="Checkout"
                              variante="secundario"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards (telas pequenas) */}
              <div className="md:hidden divide-y divide-slate-100">
                {reservas.map((reserva) => (
                  <div key={reserva.id} className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-medium text-slate-900">{reserva.espacoNome}</p>
                        <p className="text-sm text-slate-500">{reserva.curso}</p>
                      </div>
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${estiloStatus(
                          reserva.status
                        )}`}
                      >
                        {reserva.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <p className="text-slate-400 text-xs">Início</p>
                        <p className="text-slate-700">{formatarData(reserva.inicio)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Fim</p>
                        <p className="text-slate-700">{formatarData(reserva.fim)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Alunos</p>
                        <p className="text-slate-700">{reserva.quantidadeAlunos}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <BotaoAcao
                        ativo={acaoEmAndamento === `${reserva.id}-checkin`}
                        onClick={() => atualizarStatus(reserva.id, "checkin")}
                        icone={<LogIn className="w-3.5 h-3.5" />}
                        label="Check-in"
                        variante="primario"
                        expandido
                      />
                      <BotaoAcao
                        ativo={acaoEmAndamento === `${reserva.id}-checkout`}
                        onClick={() => atualizarStatus(reserva.id, "checkout")}
                        icone={<LogOut className="w-3.5 h-3.5" />}
                        label="Checkout"
                        variante="secundario"
                        expandido
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function BotaoAcao({ ativo, onClick, icone, label, variante, expandido }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const estilos =
    variante === "primario"
      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
      : "bg-slate-100 text-slate-600 hover:bg-slate-200";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={ativo}
      className={`${base} ${estilos} ${expandido ? "flex-1" : ""}`}
    >
      {ativo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icone}
      {label}
    </button>
  );
}

function formatarData(valor) {
  if (!valor) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(valor));
}
