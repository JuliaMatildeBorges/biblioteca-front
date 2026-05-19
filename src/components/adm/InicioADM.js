import { Menu } from "../Menu";
import { useNavigate } from "react-router-dom";

export function InicioADM() {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100">
            <Menu />
            <main className="flex flex-col items-center py-16 px-6">
                {/* Boas-vindas */}
                <h1 className="text-3xl font-bold text-blue-900 mb-16">
                    Bem-vindo, usuário
                </h1>

            {/* Botões */}
        <div className="flex flex-col md:flex-row gap-10">

          {/* Reservas */}
          <button
            onClick={() => navigate("/minhas-reservas")}
            className="w-82 h-102 bg-blue-900 hover:bg-blue-950 transition rounded-3xl shadow-xl text-white text-2xl font-semibold flex items-center justify-center text-center px-15"
          >
            Ver minhas reservas
          </button>

          {/* Fazer Reserva */}
          <button
            onClick={() => navigate("/fazer-reserva")}
            className="w-82 h-102 bg-white border-4 border-blue-900 hover:bg-blue-100 transition rounded-3xl shadow-xl text-blue-900 text-2xl font-semibold flex items-center justify-center text-center px-6"
          >
            Fazer reserva
          </button>

                    {/* Salas e computadores*/}
          <button
            onClick={() => navigate("/fazer-reserva")}
            className="w-82 h-102 bg-blue-900 hover:bg-blue-950 transition rounded-3xl shadow-xl text-white text-2xl font-semibold flex items-center justify-center text-center px-15"
          >
            Salas e computadores
          </button>

          {/* Visualização geral */}
          <button
            onClick={() => navigate("/minhas-reservas")}
            className="w-82 h-102 bg-white border-4 border-blue-900 hover:bg-blue-100 transition rounded-3xl shadow-xl text-blue-900 text-2xl font-semibold flex items-center justify-center text-center px-6"
          >
            Visualização geral
          </button>

        </div>
            </main>
        </div>


    );

}