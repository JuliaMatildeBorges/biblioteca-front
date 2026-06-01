import { useNavigate } from "react-router-dom";
import { Menu } from "./Menu"
import { useState } from "react";
import { api, setUsuarioAtual } from "../services/api";

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mensagem, setMensagem] = useState("");

    async function fazerLogin(e) {
        e.preventDefault();
        setMensagem("");

        try {
            // Login simples para o estágio atual do projeto: busca o cadastro
            // existente e mantém o usuário no navegador.
            const usuarios = await api.get("/usuario");
            const usuario = usuarios.find((item) => item.email === email && item.senha === senha);
            if (!usuario) throw new Error("E-mail ou senha inválidos.");

            setUsuarioAtual(usuario);
            navigate(usuario.perfil === "ADMIN" ? "/inicio-adm" : "/inicio");
        } catch (erro) {
            setMensagem(erro.message);
        }
    }


    return (
        <div>
            <Menu />

            <main className="page narrow">
                <section className="panel">

                    <h1>Login</h1>

                    <p className="muted">
                        Entre com seu e-mail e senha para acessar o sistema.
                    </p>

                    <form className="form" onSubmit={fazerLogin}>
                        <label>
                            E-mail
                            <input
                                type="email"
                                value={email}
                                placeholder="Digite seu e-mail"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </label>

                        <label>
                            Senha
                            <input
                                type="password"
                                value={senha}
                                placeholder="Digite sua senha"
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </label>

                        {mensagem && <p className="alert">{mensagem}</p>}

                        <button type="submit" className="button primary full">
                            Entrar
                        </button>
                    </form>

                    <div className="center-note">
                        <p>
                            Não possui conta?
                        </p>

                        <a href="/cadastro">
                            Criar cadastro
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
}
