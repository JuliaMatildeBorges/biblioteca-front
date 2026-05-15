// Menu.js
import { Link } from "react-router-dom";

export function Menu() {
  return (
    <header className="bg-blue-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        <h1 className="text-white text-2xl font-bold tracking-wide">
            Biblioteca SENAI
        </h1>

        <nav className="flex gap-6 text-white font-medium">
          <Link
            to="/"
            className="hover:text-blue-200 transition"
          >
            Início
          </Link>

          <Link
            to="/cadastro"
            className="hover:text-blue-200 transition"
          >
            Cadastro
          </Link>

          <Link
            to="/login"
            className="hover:text-blue-200 transition"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}