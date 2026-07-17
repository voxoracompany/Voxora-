import React, { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

interface SavedProjectsProps {
  setWorkspace: (workspace: string) => void;
}

export default function SavedProjects({
  setWorkspace,
}: SavedProjectsProps) {

  const {
    projects,
    deleteProject,
    favoriteProject,
    pinProject,
    updateNotes,
    favorites,
    pinned,
  } = useProjects();


  const [search, setSearch] = useState("");


  const getCategoryBadge = (
    category: string
  ) => {


    
    switch (category) {

      case "AI Content":
        return "🟣 AI Content";

      case "App Idea":
        return "🔵 App Idea";

      case "Startup Idea":
        return "🟢 Startup Idea";

      case "Customer Research":
        return "🟠 Customer Research";

        case "Competitor Analysis":
  return "🏆 Competitor Analysis";
      
  case "Market Research":
  return "📊 Market Research";
  
  case "SWOT Analysis":
  return "📋 SWOT Analysis";
  
  default:
        return category;

    }

  };


  const filteredProjects = projects
    .filter((project) =>
      project.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    )
    .sort((a, b) => {

      const aPinned =
        pinned.includes(a.id);

      const bPinned =
        pinned.includes(b.id);

      return (
        Number(bPinned) -
        Number(aPinned)
      );

    });



  return (

    <div
      style={{
        padding: "20px",
      }}
    >


      <button
        onClick={() =>
          setWorkspace("dashboard")
        }
      >
        ← Back to Dashboard
      </button>



      <h1>
        📁 Saved Projects
      </h1>



      <p>
        Total Projects:
        {" "}
        {projects.length}
      </p>



      <input
        type="text"
        placeholder="🔍 Search projects..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          padding: "10px",
          width: "100%",
          marginBottom:
            "20px",
        }}
      />



      {
        filteredProjects.length === 0 ? (

          <p>
            No projects found.
          </p>

        ) : (


          filteredProjects.map(
            (project) => (

        
              <div
  key={project.id}
  style={{
    marginBottom: "20px",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  }}
>

{
                  pinned.includes(
                    project.id
                  ) && (

                    <p>
                      📌 Pinned Project
                    </p>

                  )
                }



                {
                  favorites.includes(
                    project.id
                  ) && (

                    <p>
                      ⭐ Favorite Project
                    </p>

                  )
                }




                <h2
  style={{
    marginBottom: "10px",
    color: "#222",
  }}
>
  {project.title}
</h2>

<span
  style={{
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "20px",
    background: "#6C63FF",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "12px",
  }}
>
  {project.category}
</span>




                <p
  style={{
    color: "#666",
    marginTop: "10px",
  }}
>
  📅 {new Date(project.createdAt).toLocaleDateString()}
</p>





                <textarea
                  placeholder="Add notes..."
                  defaultValue={
                    project.notes
                  }
                  onBlur={(e) =>
                    updateNotes(
                      project.id,
                      e.target.value
                    )
                  }
                  style={{
                    width:
                      "100%",

                    minHeight:
                      "80px",
                  }}
                />



                <br />



                <div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "15px",
  }}
>
  <button
    onClick={() => favoriteProject(project.id)}
  >
    ⭐ Favorite
  </button>

  <button
    onClick={() => pinProject(project.id)}
  >
    📌 Pin
  </button>

  <button
    onClick={() => deleteProject(project.id)}
  >
    🗑 Delete
  </button>
</div>

</div>
            )

          )

        )

      }


    </div>

  );

}