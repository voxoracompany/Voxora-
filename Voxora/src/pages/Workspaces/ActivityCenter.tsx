import React from "react";
import { useActivity } from "../../context/ActivityContext";

interface ActivityCenterProps {
  setWorkspace: (workspace: string) => void;
}

export default function ActivityCenter({
  setWorkspace,
}: ActivityCenterProps) {

  const { activities } = useActivity();

  return (
    <div>

      <button
        onClick={() => setWorkspace("dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1>
        🔔 Activity Center
      </h1>

      <p>
        View your recent Voxora actions.
      </p>

      {activities.length === 0 ? (
        <p>
          No activity yet.
        </p>
      ) : (
        activities.map((activity, index) => (
          <p key={index}>
            {activity}
          </p>
        ))
      )}

    </div>
  );
}