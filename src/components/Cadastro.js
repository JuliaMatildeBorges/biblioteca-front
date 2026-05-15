// Cadastro.js
import { Menu } from "./Menu";

export function Cadastro() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Menu />

      <main className="flex items-center justify-center py-16 px-4">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-10 border-t-8 border-blue-900">
          
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            Cadastro
          </h1>

          <p className="text-gray-600 mb-8">
            Preencha as informações abaixo para criar sua conta.
          </p>

          <form className="space-y-6">
            
            {/* Nome */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Nome Completo
              </label>

              <input
                type="text"
                placeholder="Digite seu nome"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                CPF
              </label>

              <input
                type="text"
                placeholder="000.000.000-00"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                E-mail
              </label>

              <input
                type="email"
                placeholder="Digite seu e-mail"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Senha
              </label>

              <input
                type="password"
                placeholder="Digite sua senha"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
            </div>

            {/* Tipo de Usuário */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Tipo de Usuário
              </label>

              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-800"
              >
                <option>Selecione</option>
                <option>Responsável</option>
                <option>Professor</option>
                <option>Aluno</option>
                <option>Visitante</option>
                <option>Externo</option>
              </select>
            </div>

            {/* Botão */}
            <button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-950 transition text-white py-3 rounded-lg font-bold text-lg shadow-md"
            >
              Cadastrar
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}