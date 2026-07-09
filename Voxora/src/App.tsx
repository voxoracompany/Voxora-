import "./App.css";

function App() {
  return (
    <div className="voxora">
      <nav className="navbar">
        <div className="logo">
          VOXORA
        </div>

        <div className="nav-links">
          <a href="#">Platform</a>
          <a href="#">AI Agents</a>
          <a href="#">Solutions</a>
          <a href="#">About</a>
        </div>

        <button className="launch-btn">
          Launch Voxora
        </button>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <p className="tagline">
            THE INTELLIGENCE LAYER FOR THE FUTURE OF THE AI AGE
          </p>

          <h1>
            Build, Create and Think
            <br />
            With The Power Of AI
          </h1>

          <p className="description">
            Voxora is the intelligent foundation that connects AI agents,
            creativity, automation, and human ideas into one powerful
            ecosystem.
          </p>

          <div className="buttons">
            <button className="primary">
              Start Building
            </button>

            <button className="secondary">
              Explore AI Agents
            </button>
          </div>
        </div>

        <div className="ai-card">
          <div className="circle">
            AI
          </div>

          <h2>
            Voxora Intelligence Engine
          </h2>

          <p>
            Your AI command center for ideas, content, products and
            innovation.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;