import React, { useEffect, useState } from "react";

interface SettingsProps {
  setWorkspace: (workspace: string) => void;
}

export default function Settings({
  setWorkspace,
}: SettingsProps) {

  const [name, setName] = useState(() => {
  return localStorage.getItem("voxora-name") || "";
});

const [goal, setGoal] = useState(() => {
  return localStorage.getItem("voxora-goal") || "";
});

const [saved, setSaved] = useState(false);

useEffect(() => {
  localStorage.setItem(
    "voxora-name",
    name
  );

  localStorage.setItem(
    "voxora-goal",
    goal
  );

}, [name, goal]);


const saveSettings = () => {
  localStorage.setItem(
    "voxora-name",
    name
  );

  localStorage.setItem(
    "voxora-goal",
    goal
  );

  setSaved(true);

  setTimeout(() => {
    setSaved(false);
  }, 2000);
};


return (
  <div>

    <button
      onClick={() => setWorkspace("dashboard")}
    >
      ← Back to Dashboard
    </button>

    <h1>
      ⚙️ Voxora Settings
    </h1>

    <p>
      Customize your Voxora experience.
    </p>

    <h2>
      👤 User Profile
    </h2>

    <input
      placeholder="Your name"
      value={name}
      onChange={(e) =>
        setName(e.target.value)
      }
    />


    <h2>
      🎯 Business Goal
    </h2>

    <input
      placeholder="What are you building?"
      value={goal}
      onChange={(e) =>
        setGoal(e.target.value)
      }
    />


    <h2>
      🤖 AI Preferences
    </h2>

    <p>
      Voxora will use your goals to provide better suggestions.
    </p>


    <button onClick={saveSettings}>
      💾 Save Settings
    </button>


    {saved && (
      <p>
        ✅ Settings saved!
      </p>
    )}


    <div>
      <h3>
        Current Profile
      </h3>

      <p>
        Name: {name || "Not set"}
      </p>

      <p>
        Goal: {goal || "Not set"}
      </p>

    </div>

  </div>
);
}