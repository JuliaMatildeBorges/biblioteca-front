import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./components/Home.js";
import { Login } from "./components/Login.js";
import { Cadastro } from "./components/Cadastro.js";
import { Inicio } from "./components/Inicio.js";
import { FazerReserva } from "./components/FazerReserva.js";
import { InicioADM } from "./components/adm/InicioADM.js";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/fazer-reserva" element={<FazerReserva />} />
          <Route path="/inicio-adm" element={<InicioADM />} />
        </Routes>

      </BrowserRouter>

    </div>
  );
}

export default App;
