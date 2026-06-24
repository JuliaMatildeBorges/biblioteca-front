import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./components/Login.js";
import { Cadastro } from "./components/Cadastro.js";
import { Inicio } from "./components/Inicio.js";
import { FazerReserva } from "./components/FazerReserva.js";
import { InicioADM } from "./components/adm/InicioADM.js";
import { getUsuarioAtual } from "./services/api.js";

function rotaInicial(usuario) {
  if (!usuario) return "/login";
  return usuario.perfil === "ADMIN" ? "/inicio-adm" : "/inicio";
}

function RotaPublica({ children }) {
  const usuario = getUsuarioAtual();
  return usuario ? <Navigate to={rotaInicial(usuario)} replace /> : children;
}

function RotaProtegida({ children, admin = false }) {
  const usuario = getUsuarioAtual();

  if (!usuario) return <Navigate to="/login" replace />;
  if (admin && usuario.perfil !== "ADMIN") return <Navigate to="/inicio" replace />;

  return children;
}

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={rotaInicial(getUsuarioAtual())} replace />} />
          <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
          <Route path="/cadastro" element={<RotaPublica><Cadastro /></RotaPublica>} />
          <Route path="/inicio" element={<RotaProtegida><Inicio /></RotaProtegida>} />
          <Route path="/minhas-reservas" element={<RotaProtegida><Inicio /></RotaProtegida>} />
          <Route path="/fazer-reserva" element={<RotaProtegida><FazerReserva /></RotaProtegida>} />
          <Route path="/inicio-adm" element={<RotaProtegida admin><InicioADM /></RotaProtegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
