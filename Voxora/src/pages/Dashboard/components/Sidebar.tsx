type SidebarProps = {
  setWorkspace: (workspace: string) => void;
};

const Sidebar = ({ setWorkspace }: SidebarProps) => {
  return (
    <aside className="sidebar">
      <h2>Voxora</h2>

      <nav>
        <p
          className="active"
          onClick={() => setWorkspace("dashboard")}
        >
          Dashboard
        </p>

        <p onClick={() => setWorkspace("content")}>
          AI Content Ideas
        </p>

        <p onClick={() => setWorkspace("apps")}>
          App Ideas
        </p>

        <p onClick={() => setWorkspace("startup")}>
          Startup Ideas
        </p>

        <p onClick={() => setWorkspace("saved")}>
          Saved Projects
        </p>
      </nav>

      <div className="profile">
        <p>Bethel</p>
        <span>Creator</span>
      </div>
    </aside>
  );
};

export default Sidebar;