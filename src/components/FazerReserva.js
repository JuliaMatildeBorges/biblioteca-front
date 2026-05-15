// FazerReserva.js
import { Menu } from "./Menu";
import { useState } from "react";

export function FazerReserva() {

  // Simulando dados vindos do back-end
  const [salas, setSalas] = useState([
    {
      id: 1,
      nome: "Sala de Informática 01",
      capacidade: 5,
      ativa: true,
    },
    {
      id: 2,
      nome: "Laboratório Maker",
      capacidade: 5,
      ativa: true,
    },
    {
      id: 3,
      nome: "Sala de Estudos",
      capacidade: 5,
      ativa: false,
    },
  ]);

  // Inativar / ativar sala
  function toggleSala(id) {
    setSalas((salasAtuais) =>
      salasAtuais.map((sala) =>
        sala.id === id
          ? { ...sala, ativa: !sala.ativa }
          : sala
      )
    );
  }

  // Criar nova sala
  function adicionarSala() {

    const novaSala = {
      id: salas.length + 1,
      nome: `Nova Sala ${salas.length + 1}`,
      capacidade: 10,
      ativa: true,
    };

    setSalas([...salas, novaSala]);
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <Menu />

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">

          <div>
            <h1 className="text-4xl font-bold text-blue-900">
              Fazer Reserva
            </h1>

            <p className="text-gray-600 mt-2">
              Gerencie as salas disponíveis para reserva.
            </p>
          </div>
        </div>

        {/* Lista de salas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {salas.map((sala) => (
            <div
              key={sala.id}
              className={`rounded-2xl shadow-lg p-6 transition
                ${
                  sala.ativa
                    ? "bg-white border-t-8 border-blue-900"
                    : "bg-gray-200 opacity-70"
                }
              `}
            >

              {/* Nome */}
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                {sala.nome}
              </h2>

              {/* Informações */}
              <div className="space-y-2 mb-6 text-gray-700">

                <p>
                  <span className="font-semibold">
                    Capacidade:
                  </span>{" "}
                  {sala.capacidade} pessoas
                </p>

                <p>
                  <span className="font-semibold">
                    Status:
                  </span>{" "}
                  {sala.ativa ? "Ativa" : "Inativa"}
                </p>
              </div>

              {/* Botões */}
              <div className="flex flex-col gap-3">

                <button
                  disabled={!sala.ativa}
                  className={`w-full py-3 rounded-xl font-semibold transition
                    ${
                      sala.ativa
                        ? "bg-blue-900 hover:bg-blue-950 text-white"
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                    }
                  `}
                >
                  Reservar Sala
                </button>


              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}