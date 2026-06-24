import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "../assets/logo.png";

const API_URL = process.env.REACT_APP_API_URL;

const MENSAGEM_ERRO_PADRAO =
  "Não foi possível fazer login. Tente novamente em alguns instantes.";
const MENSAGEM_CREDENCIAIS_INVALIDAS = "Email ou senha inválidos.";

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Interpreta a resposta de erro do /login com segurança. O back-end pode
// devolver um corpo em texto simples (ex: "Credenciais Inválidas!") ou um
// JSON estruturado, dependendo do tipo de erro — nunca repassamos texto
// bruto de exceções/stack traces para o usuário, apenas mensagens conhecidas.
async function interpretarErroLogin(resposta) {
  if (resposta.status === 401) {
    return MENSAGEM_CREDENCIAIS_INVALIDAS;
  }

  if (resposta.status === 400) {
    // Erro de validação do Bean Validation (email/senha em branco, email inválido)
    try {
      const corpo = await resposta.json();
      const listaErros = corpo?.errors || corpo?.fieldErrors || corpo?.violations;
      if (Array.isArray(listaErros) && listaErros[0]?.message) {
        return listaErros[0].message;
      }
    } catch {
      // corpo não era JSON, ignora e cai no fallback
    }
    return "Verifique o email e a senha informados.";
  }

  return MENSAGEM_ERRO_PADRAO;
}

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState({});
  const [erroServidor, setErroServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  function validar() {
    const novosErros = {};

    if (!email.trim()) {
      novosErros.email = "O email deve ser preenchido.";
    } else if (!validarEmail(email)) {
      novosErros.email = "O email deve ser válido.";
    }

    if (!senha) {
      novosErros.senha = "A senha deve ser preenchida.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function fazerLogin(evento) {
    evento.preventDefault();
    setErroServidor("");

    if (!validar()) return;

    setEnviando(true);
    try {
      const resposta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), senha }),
      });

      if (!resposta.ok) {
        const mensagem = await interpretarErroLogin(resposta);
        setErroServidor(mensagem);
        return;
      }

      const dados = await resposta.json();

      localStorage.setItem("token", dados.token);

      const usuarioAtual = {
        id: dados.id,
        nome: dados.nome,
        email: dados.email || email.trim(),
        perfil: dados.tipo,
      };
      localStorage.setItem("usuarioAtual", JSON.stringify(usuarioAtual));

      navigate(dados.tipo === "ADMIN" ? "/inicio-adm" : "/inicio");
    } catch {
      // Erro de rede (sem conexão, API fora do ar, CORS, etc.)
      setErroServidor(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="institutional-page">
      {/* Faixa institucional */}
      <div className="brand-strip" />

      <div className="auth-shell">
        <div className="auth-container login">
          {/* Cabeçalho com espaço para logo */}
          <div className="brand-header">
            <div className="brand-mark">
              <img src={Logo} alt="Logo SENAI/SESI" className="brand-logo" />
            </div>
            <h1 className="brand-title">
              Biblioteca SENAI / SESI
            </h1>
            <p className="brand-subtitle">
              Agendamento de salas e computadores
            </p>
          </div>

          {/* Card do formulário */}
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Entrar</h2>
              <p>
                Acesse sua conta para continuar
              </p>
            </div>

            <form onSubmit={fazerLogin} className="auth-form">
              {erroServidor && (
                <div className="alert">
                  {erroServidor}
                </div>
              )}

              <Campo label="Email" erro={erros.email}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (erros.email) setErros((a) => ({ ...a, email: undefined }));
                  }}
                  placeholder="nome@email.com"
                  className={inputClasse(erros.email)}
                  autoComplete="email"
                />
              </Campo>

              <Campo label="Senha" erro={erros.senha}>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      if (erros.senha) setErros((a) => ({ ...a, senha: undefined }));
                    }}
                    placeholder="Digite sua senha"
                    className={inputClasse(erros.senha) + " pr-10"}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </Campo>

              <button
                type="submit"
                disabled={enviando}
                className="button primary full mt-2"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>

              <p className="text-center text-sm text-slate-500 pt-1">
                Não possui uma conta?{" "}
                <a
                  href="/cadastro"
                  className="font-extrabold text-biblioteca-primary hover:underline"
                >
                  Cadastre-se
                </a>
              </p>
            </form>
          </div>

          <p className="auth-footer">
            © {new Date().getFullYear()} Biblioteca SENAI/SESI — Todos os direitos
            reservados
          </p>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, erro, obrigatorio, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {obrigatorio && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {erro && <p className="text-red-500 text-xs mt-1.5">{erro}</p>}
    </div>
  );
}

function inputClasse(erro) {
  return [
    "w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
    "focus:outline-none focus:ring-2 focus:ring-biblioteca-primary/25 transition-shadow",
    erro
      ? "border-red-300 focus:border-red-400"
      : "border-biblioteca-line focus:border-biblioteca-primary",
  ].join(" ");
}
