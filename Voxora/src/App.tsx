function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex justify-between items-center px-10 py-6 border-b border-white/10">
        <h1 className="text-3xl font-bold">
          Voxora
        </h1>

        <button className="bg-white text-black px-6 py-2 rounded-full">
          Enter Platform
        </button>
      </header>

      <main className="flex flex-col items-center justify-center text-center min-h-[80vh] px-6">
        <h2 className="text-5xl font-bold max-w-5xl">
          The Intelligence Layer For The Future Of AI Agents
        </h2>

        <p className="mt-6 text-gray-400 text-lg max-w-3xl">
          Voxora is building the foundation where humans and AI agents
          create, collaborate, and transform ideas into reality.
        </p>

        <div className="flex gap-4 mt-10">
          <button className="bg-blue-600 px-8 py-3 rounded-lg">
            Create AI Agent
          </button>

          <button className="border border-white/20 px-8 py-3 rounded-lg">
            Explore Ecosystem
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;