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
            creativity, automation, and human ideas into one powerful ecosystem.
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
            Your AI command center for ideas, content, products and innovation.
          </p>

        </div>

      </main>


      <section className="ecosystem">

        <h2>
          One Intelligence Layer.
          <br />
          Infinite AI Possibilities.
        </h2>

        <p>
          Voxora connects intelligent AI agents into one powerful ecosystem
          designed for creators, founders, businesses and innovators.
        </p>


        <div className="agent-grid">

          <div className="agent-card">
            <h3>🧠 Idea Agent</h3>
            <p>
              Transform thoughts into strategies, plans and new possibilities.
            </p>
          </div>


          <div className="agent-card">
            <h3>✍️ Creator Agent</h3>
            <p>
              Create content, concepts and digital experiences with AI.
            </p>
          </div>


          <div className="agent-card">
            <h3>🚀 Startup Agent</h3>
            <p>
              Turn ideas into products, businesses and growth strategies.
            </p>
          </div>


          <div className="agent-card">
            <h3>⚙️ Automation Agent</h3>
            <p>
              Build intelligent workflows that save time and increase output.
            </p>
          </div>

        </div>

      </section>



      <section className="why-voxora">

        <h2>
          Why Voxora?
        </h2>

        <p>
          The future will not be powered by one AI.
          It will be powered by intelligent systems working together.
        </p>


        <div className="why-grid">

          <div className="why-card">
            <h3>🌐 Connected Intelligence</h3>
            <p>
              Voxora brings multiple AI agents together into one unified
              intelligence layer.
            </p>
          </div>


          <div className="why-card">
            <h3>⚡ Faster Creation</h3>
            <p>
              Move from ideas to execution faster with AI-powered tools.
            </p>
          </div>


          <div className="why-card">
            <h3>🧩 Endless Possibilities</h3>
            <p>
              Build, automate and innovate across different areas using
              intelligent AI systems.
            </p>
          </div>

        </div>

      </section>



      <section className="how-it-works">

        <h2>
          How Voxora Works
        </h2>

        <p>
          From a simple idea to intelligent execution, Voxora connects humans
          with powerful AI systems.
        </p>


        <div className="steps">

          <div className="step-card">
            <span>01</span>
            <h3>Share Your Idea</h3>
            <p>
              Start with a thought, challenge, or goal you want to achieve.
            </p>
          </div>


          <div className="step-card">
            <span>02</span>
            <h3>Activate AI Agents</h3>
            <p>
              Voxora selects intelligent agents designed for your objective.
            </p>
          </div>


          <div className="step-card">
            <span>03</span>
            <h3>Create & Execute</h3>
            <p>
              Turn AI-powered insights into real products, content and solutions.
            </p>
          </div>


          <div className="step-card">
            <span>04</span>
            <h3>Achieve Results</h3>
            <p>
              Transform ideas into outcomes with continuous intelligence.
            </p>
          </div>

        </div>

      </section>


    </div>
  );
}

export default App;