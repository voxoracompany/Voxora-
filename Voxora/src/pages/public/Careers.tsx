import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

const JOBS = [
  { title: "Senior Full-Stack Engineer", dept: "Engineering", location: "Remote", type: "Full-time" },
  { title: "AI/ML Engineer", dept: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Product Designer", dept: "Design", location: "Remote", type: "Full-time" },
  { title: "Product Manager", dept: "Product", location: "Remote", type: "Full-time" },
  { title: "Growth Marketing Manager", dept: "Marketing", location: "Remote", type: "Full-time" },
  { title: "Developer Advocate", dept: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Customer Success Manager", dept: "Operations", location: "Remote", type: "Full-time" },
];

const PERKS = [
  { icon: "🌍", title: "Fully Remote", desc: "Work from anywhere in the world. We hire globally." },
  { icon: "💰", title: "Competitive Pay", desc: "Top-of-market salaries with meaningful equity." },
  { icon: "🏥", title: "Health & Wellness", desc: "Full health, dental, and vision coverage." },
  { icon: "📚", title: "Learning Budget", desc: "$2,000/year for courses, books, and conferences." },
  { icon: "🖥️", title: "Home Office Setup", desc: "$1,500 stipend to build your ideal workspace." },
  { icon: "🌴", title: "Unlimited PTO", desc: "We trust you to manage your time and recharge." },
];

export default function Careers() {
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <PublicNav />

      {/* Hero */}
      <section className="pub-hero">
        <p className="pub-hero-label">✦ CAREERS AT VOXORA</p>
        <h1>Build the Future of AI<br />With Us</h1>
        <p>
          We're a small team with big ambitions. Join us to shape the intelligence layer
          that empowers the next generation of creators and founders.
        </p>
        <div className="pub-hero-actions">
          <a href="#open-roles" className="btn-white">View Open Roles</a>
          <button className="btn-outline-white" onClick={() => navigate("/about")}>About the Team</button>
        </div>
      </section>

      {/* Perks */}
      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ BENEFITS & PERKS</p>
        <h2>Why You'll Love Working Here</h2>
        <p className="pub-section-sub">We take care of our team so you can focus on doing your best work.</p>
        <div className="pub-grid">
          {PERKS.map((p) => (
            <div className="pub-card" key={p.title}>
              <div className="pub-card-icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Jobs */}
      <section className="pub-section bg-gray" id="open-roles">
        <p className="pub-section-label">✦ OPEN ROLES</p>
        <h2>Current Openings</h2>
        <p className="pub-section-sub">All roles are fully remote. We welcome applicants from anywhere in the world.</p>
        <div className="pub-jobs-list">
          {JOBS.map((job) => (
            <div className="pub-job-card" key={job.title}>
              <div className="pub-job-info">
                <h3>{job.title}</h3>
                <div className="pub-job-badges">
                  <span className="pub-job-badge">{job.dept}</span>
                  <span className="pub-job-badge">{job.location}</span>
                  <span className="pub-job-badge">{job.type}</span>
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ fontSize: 13, padding: "9px 20px" }}
                onClick={() => navigate("/contact")}
              >
                Apply →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pub-cta">
        <h2>Don't See Your Role?</h2>
        <p>We're always looking for exceptional people. Send us your resume and tell us how you'd contribute.</p>
        <div className="pub-cta-actions">
          <button className="btn-white" onClick={() => navigate("/contact")}>Get in Touch →</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
