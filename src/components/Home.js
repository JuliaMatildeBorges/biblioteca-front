import { Menu } from "./Menu";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <div>
      <Menu />

      <main className="hero">
        <section className="hero-content">
          <p className="eyebrow">Reservas de computadores e salas de estudo</p>
          <h1>Biblioteca Inteligente</h1>

          <p>
            Controle horários, acompanhe suas reservas, faça check-in e organize
            os espaços de estudo com uma experiência clara para alunos e administração.
          </p>

          <div className="actions">
            <Link to="/login" className="button primary">Fazer login</Link>
            <Link to="/cadastro" className="button secondary">Criar conta</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
