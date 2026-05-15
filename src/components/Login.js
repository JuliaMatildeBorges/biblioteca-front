import { useNavigate } from "react-router-dom";
import { Menu } from "./Menu"
import { useState, useEfect } from "react";

export function Login() {


    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    async function fazerLogin(e) {

        e.preventDefault();

        try {

            const resposta = await fetch(
                "http://localhost:8080/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        senha: senha
                    })
                }
            );

            if (!resposta.ok) {
                throw new Error("Erro no login");
            }

            const dados = await resposta.json();

            console.log(dados);

            alert("Login realizado!");
            navigate('/inicio')

        } catch (erro) {

            console.log(erro);

            alert("Erro na conexão com o sistema");

        }
    }


    return (
        <div className="min-h-screen bg-gray-100">
            <Menu />

            <main className="flex items-center justify-center py-20 px-4">
                <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-10 border-t-8 border-blue-900">

                    <h1 className="text-4xl font-bold text-blue-900 mb-2">
                        Login
                    </h1>

                    <p className="text-gray-600 mb-8">
                        Entre com seu e-mail e senha para acessar o sistema.
                    </p>

                    <form className="space-y-6">

                        {/* Email */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">
                                E-mail
                            </label>

                            <input
                                type="email"
                                placeholder="Digite seu e-mail"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-800"
                                onChange={(e) => setEmail(e.target.value)}
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
                                 onChange={(e) => setSenha(e.target.value)}
                            />
                        </div>

                        {/* Botão */}
                        <button
                            onClick={fazerLogin}
                            className="w-full bg-blue-900 hover:bg-blue-950 transition text-white py-3 rounded-lg font-bold text-lg shadow-md"

                        >
                            Entrar
                        </button>
                    </form>

                    {/* Cadastro */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Não possui conta?
                        </p>

                        <a
                            href="/cadastro"
                            className="text-blue-900 font-semibold hover:underline"
                        >
                            Criar cadastro
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}