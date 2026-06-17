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
        const response = await fetch("http://localhost:8080/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                senha
            })
        });

        if (!response.ok) {
            throw new Error("E-mail ou senha inválidos.");
        }

        const dados = await response.json();

        localStorage.setItem("token", dados.token);

        const usuario = {
            email,
            perfil: dados.tipo
        };

        localStorage.setItem(
            "usuarioAtual",
            JSON.stringify(usuario)
        );

        navigate(
            dados.tipo === "ADMIN"
                ? "/inicio-adm"
                : "/inicio"
        );

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
