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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Faixa institucional */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-blue-600 to-red-600" />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Cabeçalho com espaço para logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-xl bg-white border-2 border-dashed border-blue-200 flex items-center justify-center mb-4">
              <img src={Logo} alt="Logo SENAI/SESI" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Biblioteca SENAI / SESI
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Agendamento de salas e computadores
            </p>
          </div>

          {/* Card do formulário */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="bg-blue-700 px-8 py-6">
              <h2 className="text-white font-semibold text-lg">Entrar</h2>
              <p className="text-blue-100 text-sm mt-0.5">
                Acesse sua conta para continuar
              </p>
            </div>

            <form onSubmit={fazerLogin} className="p-8 space-y-5">
              {erroServidor && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
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
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
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
                  className="text-blue-700 font-medium hover:underline"
                >
                  Cadastre-se
                </a>
              </p>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
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
    "focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow",
    erro
      ? "border-red-300 focus:border-red-400"
      : "border-slate-200 focus:border-blue-400",
  ].join(" ");
}
