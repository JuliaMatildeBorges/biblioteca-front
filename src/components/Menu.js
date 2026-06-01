// Menu.js
import { Link } from "react-router-dom";
import { getUsuarioAtual } from "../services/api";

export function Menu() {
  const usuario = getUsuarioAtual();

  return (
    <header className="topbar">
      <Link to="/" className="brand">Biblioteca SENAI</Link>

      <nav className="nav">
        <Link to="/">Início</Link>
        <Link to="/fazer-reserva">Reservar</Link>
        <Link to="/inicio">Minhas reservas</Link>
        {usuario?.perfil === "ADMIN" && <Link to="/inicio-adm">Admin</Link>}
        {!usuario && <Link to="/cadastro">Cadastro</Link>}
        <Link to="/login">{usuario ? "Trocar usuário" : "Login"}</Link>
      </nav>
    </header>
  );
}
