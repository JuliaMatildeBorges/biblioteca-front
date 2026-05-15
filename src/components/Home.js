import { Menu } from "./Menu";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Menu />

      <main className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-5xl font-bold text-blue-900 mb-6">
          Biblioteca Inteligente
        </h1>

        <p className="text-gray-700 text-lg max-w-2xl mb-8">
          Sistema moderno para gerenciamento e reserva de salas,
          computadores e recursos da biblioteca.
        </p>

        <div className="flex gap-4">
          <Link to="/login" className="bg-blue-800 hover:bg-blue-900 transition text-white px-6 py-3 rounded-lg font-semibold shadow-md" >
            Fazer Login
          </Link>

          <Link to="/cadastro" className="border-2 border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white transition px-6 py-3 rounded-lg font-semibold">
            Criar Conta
          </Link>
        </div>
      </main>
    </div>
  );
}