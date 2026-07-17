import { useActivity } from "../../context/ActivityContext";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import FeatureCard from "./components/FeatureCard";
import AIContent from "../Workspaces/AIContent";
import AppIdeas from "../Workspaces/AppIdeas";
import StartupIdeas from "../Workspaces/StartupIdeas";
import SavedProjects from "../Workspaces/SavedProjects";
import CustomerResearch from "../Workspaces/CustomerResearch";
import MarketResearch from "../Workspaces/MarketResearch";
import AIAssistant from "../Workspaces/AIAssistant";
import Settings from "../Workspaces/Settings";
import ProductValidation from "../Workspaces/ProductValidation";
import CustomerPersona from "../Workspaces/CustomerPersona";
import BusinessModelCanvas from "../Workspaces/BusinessModelCanvas";
import CompetitorAnalysis from "../Workspaces/CompetitorAnalysis";
import SWOTAnalysis from "../Workspaces/SWOTAnalysis";
import ProductRoadmap from "../Workspaces/ProductRoadmap";
import { useProjects } from "../../context/ProjectContext";
import "./Dashboard.css";

const Dashboard = () => {

  const userName =
    localStorage.getItem("voxora-name") || "";

  const [chatCount, setChatCount] = useState(() => {
    return (
      Number(
        localStorage.getItem(
          "voxora-chat-count"
        )
      ) || 0
    );
  });


  useEffect(() => {

    const updateChatCount = () => {
      setChatCount(
        Number(
          localStorage.getItem(
            "voxora-chat-count"
          )
        ) || 0
      );
    };

    window.addEventListener(
      "storage",
      updateChatCount
    );

    updateChatCount();

    return () => {
      window.removeEventListener(
        "storage",
        updateChatCount
      );
    };

  }, []);


  const [workspace, setWorkspace] =
    useState("dashboard");


  const {
    projects,
    favorites,
    pinned,
  } = useProjects();


  const { activities } =
    useActivity();


  return (

    <div className="dashboard">

      <Sidebar
        setWorkspace={setWorkspace}
        workspace={workspace}
      />


      <main className="main-content">

        <TopBar />


        {workspace === "dashboard" && (

          <>

            <div className="welcome-section">

              <h1>
                Welcome back
                {userName
                  ? `, ${userName}`
                  : ""}
                🚀
              </h1>


              <p>
                Understand customers,
                generate ideas,
                and build better products
                with AI.
              </p>

            </div>



            <div className="quick-actions">

              <h2>
                ⚡ Quick Actions
              </h2>


              <div className="cards">


                <FeatureCard
                  title="✍️ AI Content Ideas"
                  description="Generate creative content concepts."
                  buttonText="Open"
                  onClick={() =>
                    setWorkspace("content")
                  }
                />


                <FeatureCard
                  title="💡 App Ideas"
                  description="Discover and create new app concepts."
                  buttonText="Open"
                  onClick={() =>
                    setWorkspace("apps")
                  }
                />


                <FeatureCard
                  title="🚀 Startup Ideas"
                  description="Explore business opportunities."
                  buttonText="Open"
                  onClick={() =>
                    setWorkspace("startup")
                  }
                />
                
                
  <FeatureCard
  title="📈 Product Validation"
  description="Validate your startup before building."
  buttonText="Validate"
  onClick={() =>
    setWorkspace("validation")
  }
/>
                
                
               <FeatureCard
  title="👤 Customer Persona"
  description="Generate your ideal customer profile."
  buttonText="Generate"
  onClick={() => setWorkspace("persona")}
/>
               
                
                <FeatureCard
  title="📊 Business Model"
  description="Generate a complete Business Model Canvas."
  buttonText="Open"
  onClick={() => setWorkspace("business")}
 />
                
                
              <FeatureCard
                  title="🔍 Customer Research"
                  description="Understand customers and their needs."
                  buttonText="Research"
                  onClick={() =>
                    setWorkspace("research")
                  }
                />

<FeatureCard
  title="📊 Market Research"
  description="Research your market before building."
  buttonText="Research"
  onClick={() => setWorkspace("market")}
/>

<FeatureCard
  title="📋 SWOT Analysis"
  description="Analyze strengths, weaknesses, opportunities and threats."
  buttonText="Analyze"
  onClick={() => setWorkspace("swot")}
/>

<FeatureCard
  title="🏆 Competitor Analysis"
  description="Analyze competitors before building."
  buttonText="Analyze"
  onClick={() => setWorkspace("competitor")}
/>
                
                <FeatureCard
                  title="🤖 AI Assistant"
                  description="Ask Voxora anything."
                  buttonText="Chat"
                  onClick={() =>
                    setWorkspace("assistant")
                  }
                />


              </div>

            </div>

                        <div className="stats">

              <div className="stat-card">
                <h3>
                  📁 Total Projects
                </h3>
                <p>
                  {projects.length}
                </p>
              </div>


              <div className="stat-card">
                <h3>
                  📌 Pinned Ideas
                </h3>
                <p>
                  {pinned.length}
                </p>
              </div>


              <div className="stat-card">
                <h3>
                  ⭐ Favorite Ideas
                </h3>
                <p>
                  {favorites.length}
                </p>
              </div>


              <div className="stat-card">
                <h3>
                  🤖 AI Workspace
                </h3>
                <p>
                  Active
                </p>
              </div>


              <div className="stat-card">
                <h3>
                  🤖 AI Conversations
                </h3>
                <p>
                  {chatCount}
                </p>
              </div>


            </div>
            
            <div className="activity-card">

              <h2>
                🕒 Recent Activity
              </h2>


              {activities.length === 0 ? (

                <p>
                  No activity yet.
                </p>

              ) : (

                activities
                  .slice(0, 5)
                  .map((activity, index) => (

                    <p key={index}>
                      {activity}
                    </p>

                  ))

              )}

            </div>



            <h2>
              📁 Recent Projects
            </h2>


            {projects.length === 0 ? (

              <p>
                No saved projects yet.
              </p>

            ) : (

              projects
                .slice(-3)
                .reverse()
                .map((project) => (

                  <div
                    key={project.id}
                    className="recent-project-card"
                  >

                    <h3>
                      {project.title}
                    </h3>


                    <p>
                      🏷️ {project.category}
                    </p>


                    <p>
                      📅{" "}
                      {new Date(
                        project.createdAt
                      ).toLocaleDateString()}
                    </p>


                    {pinned.includes(project.id) && (

                      <span>
                        📌 Pinned
                      </span>

                    )}


                    {favorites.includes(project.id) && (

                      <span>
                        ⭐ Favorite
                      </span>

                    )}

                  </div>

                ))

            )}

          </>

        )}



        {workspace === "content" && (
          <AIContent
            setWorkspace={setWorkspace}
          />
        )}


        {workspace === "apps" && (
          <AppIdeas
            setWorkspace={setWorkspace}
          />
        )}


        {workspace === "startup" && (
          <StartupIdeas
            setWorkspace={setWorkspace}
          />
        )}


        {workspace === "validation" && (
  <ProductValidation
    setWorkspace={setWorkspace}
  />
)}
        
        
       {workspace === "persona" && (
  <CustomerPersona
    setWorkspace={setWorkspace}
  />
)}
       
       
       {workspace === "saved" && (
          <SavedProjects
            setWorkspace={setWorkspace}
          />
        )}


        {workspace === "research" && (
          <CustomerResearch
            setWorkspace={setWorkspace}
          />
        )}


        {workspace === "assistant" && (
          <AIAssistant
            setWorkspace={setWorkspace}
          />
        )}


       {workspace === "business" && (
  <BusinessModelCanvas
    setWorkspace={setWorkspace}
  />
)}
       
        
        {workspace === "settings" && (
          <Settings
            setWorkspace={setWorkspace}
          />
        )}

{workspace === "competitor" && (
  <CompetitorAnalysis
    setWorkspace={setWorkspace}
  />
)}
      
      {workspace === "market" && (
  <MarketResearch
    setWorkspace={setWorkspace}
  />
)}
      
      {workspace === "swot" && (
  <SWOTAnalysis
    setWorkspace={setWorkspace}
  />
)}
      
      
      {workspace === "productRoadmap" && (
  <ProductRoadmap setWorkspace={setWorkspace} />
)}
      
      </main>

    </div>

  );

};


export default Dashboard;