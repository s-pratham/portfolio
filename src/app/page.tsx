import Story from "@/components/Story";
import { person } from "@/content";

export default function Home() {
  return (
    <>
      <header className="top">
        <a href="#" className="top-name">
          {person.name}
        </a>
        <nav aria-label="Projects">
          <a href="#infra">InfraSwitch</a>
          <a href="#switch-ai">Switch AI</a>
          <a href="#light">Light</a>
          <a href="#agent-org">agent-org</a>
          <a href="#civitas">Civitas</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>
      <main>
        <Story />
      </main>
      <footer className="foot">
        <p>Prathamesh Sonawane, 2026</p>
      </footer>
    </>
  );
}
