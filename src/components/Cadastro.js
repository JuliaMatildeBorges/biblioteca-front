import { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";


const API_URL = process.env.REACT_APP_API_URL;

// Espelha os enums do back-end (Instituicao e TipoUsuario)
const INSTITUICOES = [
  { value: "SENAI", label: "SENAI" },
  { value: "SESI", label: "SESI" },
];

const TIPOS_USUARIO = [
  { value: "ALUNO", label: "Aluno" },
  { value: "COLABORADOR", label: "Colaborador" },
  { value: "TERCEIROS", label: "Terceiros" },
];

const ESTADO_INICIAL = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  cpf: "",
  telefone: "",
  instituicao: "",
  tipo: "",
};

function formatarCpf(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 10) {
    return digitos
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digitos
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCpf(cpfFormatado) {
  const cpf = cpfFormatado.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

const MENSAGEM_ERRO_PADRAO =
  "Não foi possível concluir o cadastro. Tente novamente em alguns instantes.";

// Mapeia os nomes de campo do DTO para os nomes usados no formulário,
// para conseguir exibir erros de validação do back-end no campo certo.
const CAMPOS_DTO_PARA_FORM = {
  email: "email",
  senha: "senha",
  nome: "nome",
  cpf: "cpf",
  telefone: "telefone",
  instituicao: "instituicao",
  tipo: "tipo",
};

// Extrai, com segurança, uma mensagem amigável e (quando possível) erros
// por campo a partir da resposta de erro da API. Nunca repassa texto bruto
// de exceções, stack traces ou mensagens de SQL para o usuário.
async function interpretarErroResposta(resposta) {
  let corpo = null;
  try {
    corpo = await resposta.json();
  } catch {
    corpo = null;
  }

  // Erros de validação do Bean Validation (Spring) costumam vir como
  // { errors: [{ field: "email", message: "..." }] } ou { fieldErrors: {...} }.
  const listaErros = corpo?.errors || corpo?.fieldErrors || corpo?.violations;
  const errosPorCampo = {};

  if (Array.isArray(listaErros)) {
    listaErros.forEach((item) => {
      const campoBackend = item?.field || item?.fieldName;
      const campoForm = CAMPOS_DTO_PARA_FORM[campoBackend];
      if (campoForm && typeof item?.message === "string") {
        errosPorCampo[campoForm] = item.message;
      }
    });
  } else if (listaErros && typeof listaErros === "object") {
    Object.entries(listaErros).forEach(([campoBackend, mensagem]) => {
      const campoForm = CAMPOS_DTO_PARA_FORM[campoBackend];
      if (campoForm && typeof mensagem === "string") {
        errosPorCampo[campoForm] = mensagem;
      }
    });
  }

  // Conflitos conhecidos (email ou CPF já cadastrados) são comuns e seguros
  // de comunicar de forma específica.
  if (resposta.status === 409) {
    return {
      mensagemGeral: "Já existe um usuário cadastrado com este email ou CPF.",
      errosPorCampo,
    };
  }

  if (resposta.status === 400 && Object.keys(errosPorCampo).length > 0) {
    return {
      mensagemGeral: "Verifique os dados informados e tente novamente.",
      errosPorCampo,
    };
  }

  // Para qualquer outro caso (erro interno, banco de dados, etc.), nunca
  // expomos o conteúdo retornado pela API — apenas uma mensagem genérica.
  return { mensagemGeral: MENSAGEM_ERRO_PADRAO, errosPorCampo: {} };
}

export function Cadastro() {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [erros, setErros] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroServidor, setErroServidor] = useState("");
  const navigate = useNavigate();

  const irParaLogin = () => {
    navigate("/login");
  }

  function atualizarCampo(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
    if (erros[campo]) {
      setErros((anterior) => ({ ...anterior, [campo]: undefined }));
    }
  }

  function validar() {
    const novosErros = {};

    if (!form.nome.trim()) {
      novosErros.nome = "O nome é obrigatório";
    }

    if (!form.email.trim()) {
      novosErros.email = "O email é obrigatório";
    } else if (!validarEmail(form.email)) {
      novosErros.email = "O email deve ser válido";
    }

    if (!form.senha) {
      novosErros.senha = "A senha é obrigatória";
    } else if (form.senha.length < 6) {
      novosErros.senha = "A senha deve ter ao menos 6 caracteres";
    }

    if (form.confirmarSenha !== form.senha) {
      novosErros.confirmarSenha = "As senhas não coincidem";
    }

    if (!form.cpf.trim()) {
      novosErros.cpf = "O CPF é obrigatório";
    } else if (!validarCpf(form.cpf)) {
      novosErros.cpf = "Informe um CPF válido";
    }

    if (!form.telefone.trim()) {
      novosErros.telefone = "O telefone é obrigatório";
    } else if (form.telefone.replace(/\D/g, "").length < 10) {
      novosErros.telefone = "Informe um telefone válido";
    }

    if (!form.instituicao) {
      novosErros.instituicao = "A instituição é obrigatória";
    }

    if (!form.tipo) {
      novosErros.tipo = "O tipo é obrigatório";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErroServidor("");

    if (!validar()) return;

    const payload = {
      email: form.email.trim(),
      senha: form.senha,
      nome: form.nome.trim(),
      cpf: form.cpf.replace(/\D/g, ""),
      telefone: form.telefone.replace(/\D/g, ""),
      instituicao: form.instituicao,
      tipo: form.tipo,
    };

    setEnviando(true);
    try {
      const resposta = await fetch(`${API_URL}/usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resposta.ok) {
        const { mensagemGeral, errosPorCampo } = await interpretarErroResposta(
          resposta
        );

        if (Object.keys(errosPorCampo).length > 0) {
          setErros((anterior) => ({ ...anterior, ...errosPorCampo }));
        }
        setErroServidor(mensagemGeral);
        return;
      }

      setSucesso(true);
      setForm(ESTADO_INICIAL);
    } catch {
      // Erro de rede (sem conexão, API fora do ar, CORS, etc.)
      setErroServidor(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="institutional-page flex items-center justify-center p-4">
        <div className="auth-card max-w-md w-full p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <CheckCircle2 className="h-9 w-9 text-biblioteca-primary" strokeWidth={1.75} />
          </div>
          <h2 className="mb-2 text-xl font-extrabold text-biblioteca-primaryDark">
            Cadastro realizado
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-biblioteca-muted">
            Sua conta foi criada com sucesso. Agora você já pode acessar o
            sistema de agendamento de salas e computadores da biblioteca.
          </p>
          <div className="grid gap-4">
            <button
              onClick={() => setSucesso(false)}
              className="button primary full"
            >
              Cadastrar outro usuário
            </button>

            <button
              className="button primary full"
              onClick={irParaLogin}
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="institutional-page">
      {/* Faixa institucional */}
      <div className="brand-strip" />

      <div className="auth-shell">
        <div className="auth-container register">
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
              <h2>
                Criar nova conta
              </h2>
              <p>
                Preencha os dados abaixo para se cadastrar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {erroServidor && (
                <div className="alert">
                  {erroServidor}
                </div>
              )}

              {/* Nome */}
              <Campo label="Nome completo" erro={erros.nome}>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => atualizarCampo("nome", e.target.value)}
                  placeholder="Ex: Maria da Silva"
                  className={inputClasse(erros.nome)}
                  autoComplete="name"
                />
              </Campo>

              {/* Email e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Campo label="Email" erro={erros.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => atualizarCampo("email", e.target.value)}
                    placeholder="nome@email.com"
                    className={inputClasse(erros.email)}
                    autoComplete="email"
                  />
                </Campo>

                <Campo label="Telefone" erro={erros.telefone}>
                  <input
                    type="tel"
                    value={form.telefone}
                    onChange={(e) =>
                      atualizarCampo("telefone", formatarTelefone(e.target.value))
                    }
                    placeholder="(00) 00000-0000"
                    className={inputClasse(erros.telefone)}
                    autoComplete="tel"
                  />
                </Campo>
              </div>

              {/* CPF */}
              <Campo label="CPF" erro={erros.cpf}>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => atualizarCampo("cpf", formatarCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className={inputClasse(erros.cpf)}
                  inputMode="numeric"
                />
              </Campo>

              {/* Instituição e Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Campo label="Instituição" erro={erros.instituicao}>
                  <select
                    value={form.instituicao}
                    onChange={(e) => atualizarCampo("instituicao", e.target.value)}
                    className={inputClasse(erros.instituicao)}
                  >
                    <option value="">Selecione</option>
                    {INSTITUICOES.map((opcao) => (
                      <option key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo label="Tipo de usuário" erro={erros.tipo}>
                  <select
                    value={form.tipo}
                    onChange={(e) => atualizarCampo("tipo", e.target.value)}
                    className={inputClasse(erros.tipo)}
                  >
                    <option value="">Selecione</option>
                    {TIPOS_USUARIO.map((opcao) => (
                      <option key={opcao.value} value={opcao.value}>
                        {opcao.label}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Senha e Confirmar senha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Campo label="Senha" erro={erros.senha}>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      value={form.senha}
                      onChange={(e) => atualizarCampo("senha", e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className={inputClasse(erros.senha) + " pr-10"}
                      autoComplete="new-password"
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

                <Campo label="Confirmar senha" erro={erros.confirmarSenha}>
                  <div className="relative">
                    <input
                      type={mostrarConfirmarSenha ? "text" : "password"}
                      value={form.confirmarSenha}
                      onChange={(e) =>
                        atualizarCampo("confirmarSenha", e.target.value)
                      }
                      placeholder="Repita a senha"
                      className={inputClasse(erros.confirmarSenha) + " pr-10"}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmarSenha((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                      aria-label={
                        mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {mostrarConfirmarSenha ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </Campo>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="button primary full mt-2"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Criar conta"
                )}
              </button>

              <p className="text-center text-sm text-slate-500 pt-1">
                Já possui uma conta?{" "}
                <a href="/login" className="font-extrabold text-biblioteca-primary hover:underline">
                  Entrar
                </a>
              </p>
            </form>
          </div>

          <p className="auth-footer">
            © {new Date().getFullYear()} Biblioteca SENAI/SESI — Todos os direitos reservados
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
