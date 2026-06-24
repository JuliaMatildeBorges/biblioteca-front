import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu as MenuIcon, X } from "lucide-react";
import Logo from "../assets/logo.png";
import { useState } from "react";
import { getUsuarioAtual } from "../services/api";

const LINKS_USUARIO = [
  { to: "/inicio", label: "Minhas reservas" },
  { to: "/fazer-reserva", label: "Nova reserva" },
];

const LINKS_ADMIN = [
  { to: "/inicio-adm", label: "Painel administrativo" },
];

export function Menu() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = getUsuarioAtual();
  const [menuAberto, setMenuAberto] = useState(false);

  const links = usuario?.perfil === "ADMIN" ? LINKS_ADMIN : LINKS_USUARIO;

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioAtual");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-biblioteca-line bg-white/95 shadow-sm backdrop-blur">
      <div className="brand-strip h-1" />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={() => navigate(usuario?.perfil === "ADMIN" ? "/inicio-adm" : "/inicio")}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-biblioteca-line bg-white shadow-sm">
            <img src={Logo} alt="Logo SENAI/SESI" className="h-7 w-7 object-contain" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-extrabold leading-tight text-biblioteca-primaryDark">
              Biblioteca SENAI / SESI
            </p>
            <p className="text-xs leading-tight text-biblioteca-muted">
              Agendamento de salas e computadores
            </p>
          </div>
        </button>

        {/* Navegação desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={[
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === link.to
                  ? "bg-blue-50 text-biblioteca-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {usuario?.email && (
            <span className="text-sm text-slate-500 max-w-[180px] truncate">
              {usuario.email}
            </span>
          )}
          <button
            onClick={sair}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        {/* Botão menu mobile */}
        <button
          className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          onClick={() => setMenuAberto((v) => !v)}
          aria-label="Abrir menu"
        >
          {menuAberto ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Navegação mobile */}
      {menuAberto && (
        <nav className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1">
          {links.map((link) => (
            <button
              key={link.to}
              onClick={() => {
                navigate(link.to);
                setMenuAberto(false);
              }}
              className={[
                "block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname === link.to
                  ? "bg-blue-50 text-biblioteca-primary"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={sair}
            className="flex items-center gap-1.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </nav>
      )}
    </header>
  );
}