import { useState } from "react";

export function Calendario() {

  const hoje = new Date();

  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());

  const [dataSelecionada, setDataSelecionada] = useState(null);

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const diasSemana = [
    "Dom",
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb",
  ];

  const salas = [
    "Sala 1",
    "Sala 2",
    "Sala 3",
    "Sala 4",
  ];

  const computadores = [
    "Computador 1",
    "Computador 2",
    "Computador 3",
    "Computador 4",
    "Computador 5",
    "Computador 6",
    "Computador 7",
    "Computador 8",
    "Computador 9",
  ];

  // Horários
  const horarios = [];

  for (let hora = 8; hora <= 22; hora++) {
    horarios.push(
      `${hora.toString().padStart(2, "0")}:00`
    );
  }

  // Dados calendário
  const primeiroDiaMes = new Date(
    anoAtual,
    mesAtual,
    1
  ).getDay();

  const totalDiasMes = new Date(
    anoAtual,
    mesAtual + 1,
    0
  ).getDate();

  const dias = [];

  // Espaços vazios
  for (let i = 0; i < primeiroDiaMes; i++) {
    dias.push(null);
  }

  // Dias mês
  for (let dia = 1; dia <= totalDiasMes; dia++) {
    dias.push(dia);
  }

  function proximoMes() {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  }

  function mesAnterior() {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  }

  function selecionarData(dia) {
    if (!dia) return;

    setDataSelecionada(
      new Date(anoAtual, mesAtual, dia)
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">

      <div className="flex flex-col xl:flex-row gap-6">

        {/* CALENDÁRIO */}
        <div className="bg-white flex-1 rounded-3xl shadow-2xl border-t-8 border-blue-900 p-6 md:p-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">

            <button
              onClick={mesAnterior}
              className="bg-blue-900 hover:bg-blue-950 transition text-white w-14 h-14 rounded-2xl text-2xl font-bold shadow-lg"
            >
              {"<"}
            </button>

            <h2 className="text-3xl md:text-5xl font-bold text-blue-900 text-center">
              {meses[mesAtual]} {anoAtual}
            </h2>

            <button
              onClick={proximoMes}
              className="bg-blue-900 hover:bg-blue-950 transition text-white w-14 h-14 rounded-2xl text-2xl font-bold shadow-lg"
            >
              {">"}
            </button>

          </div>

          {/* Dias semana */}
          <div className="grid grid-cols-7 gap-4 mb-4">

            {diasSemana.map((dia) => (
              <div
                key={dia}
                className="text-center font-bold text-blue-900 text-lg md:text-xl py-4"
              >
                {dia}
              </div>
            ))}

          </div>

          {/* Dias */}
          <div className="grid grid-cols-7 gap-4">

            {dias.map((dia, index) => {

              const selecionado =
                dataSelecionada &&
                dia === dataSelecionada.getDate() &&
                mesAtual ===
                  dataSelecionada.getMonth() &&
                anoAtual ===
                  dataSelecionada.getFullYear();

              return (
                <button
                  key={index}
                  onClick={() =>
                    selecionarData(dia)
                  }
                  disabled={!dia}
                  className={`
                    h-24 md:h-32 rounded-2xl text-xl md:text-2xl font-semibold transition shadow-md

                    ${
                      !dia
                        ? "bg-transparent shadow-none cursor-default"
                        : selecionado
                        ? "bg-blue-900 text-white scale-105"
                        : "bg-gray-50 hover:bg-blue-100 text-gray-800"
                    }
                  `}
                >
                  {dia}
                </button>
              );
            })}
          </div>
        </div>

        {/* MENU LATERAL */}
        {dataSelecionada && (
          <div className="w-full xl:w-[420px] bg-white rounded-3xl shadow-2xl border-t-8 border-blue-900 p-6 overflow-y-auto max-h-[90vh]">

            <h2 className="text-3xl font-bold text-blue-900 mb-2">
              Reservas
            </h2>

            <p className="text-gray-600 mb-8 text-lg">
              {dataSelecionada.toLocaleDateString(
                "pt-BR"
              )}
            </p>

            {/* SALAS */}
<div className="mb-10">

  <h3 className="text-2xl font-bold text-blue-900 mb-5">
    Salas
  </h3>

  <div className="space-y-4">

    {salas.map((sala) => (
      <details
        key={sala}
        className="bg-gray-50 rounded-2xl shadow-md overflow-hidden group"
      >

        <summary className="cursor-pointer list-none flex items-center justify-between p-5 hover:bg-gray-100 transition">

          <h4 className="text-xl font-semibold text-gray-800">
            {sala}
          </h4>

          <span className="text-blue-900 text-2xl font-bold group-open:rotate-180 transition">
            ▼
          </span>

        </summary>

        <div className="p-5 border-t border-gray-200">

          <div className="grid grid-cols-2 gap-3">

            {horarios.map((horario) => (
              <button
                key={horario}
                className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white transition rounded-xl py-3 font-semibold"
              >
                {horario}
              </button>
            ))}

          </div>
        </div>

      </details>
    ))}

  </div>
</div>

       {/* COMPUTADORES */}
<div>

  <h3 className="text-2xl font-bold text-blue-900 mb-5">
    Computadores
  </h3>

  <div className="space-y-4">

    {computadores.map((computador) => (
      <details
        key={computador}
        className="bg-gray-50 rounded-2xl shadow-md overflow-hidden group"
      >

        <summary className="cursor-pointer list-none flex items-center justify-between p-5 hover:bg-gray-100 transition">

          <h4 className="text-xl font-semibold text-gray-800">
            {computador}
          </h4>

          <span className="text-blue-900 text-2xl font-bold group-open:rotate-180 transition">
            ▼
          </span>

        </summary>

        <div className="p-5 border-t border-gray-200">

          <div className="grid grid-cols-2 gap-3">

            {horarios.map((horario) => (
              <button
                key={horario}
                className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white transition rounded-xl py-3 font-semibold"
              >
                {horario}
              </button>
            ))}

          </div>
        </div>

      </details>
    ))}

  </div>
</div>






          </div>
        )}
      </div>
    </div>
  );
}