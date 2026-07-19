import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

const POSTS = [
  {
    emoji: "🤖",
    tag: "Product",
    title: "Introducing Voxora V3: The AI Business Platform",
    excerpt: "Today we're launching V3 — our most powerful release yet, with new studios for marketing, finance, and investor readiness.",
    author: "Alex Rivera",
    date: "July 15, 2026",
    readTime: "5 min read",
  },
  {
    emoji: "🚀",
    tag: "Founders",
    title: "From Idea to MVP: A Framework for AI-Assisted Validation",
    excerpt: "Learn how to use Voxora's Startup Studio and Customer Research tools to validate your idea before writing a single line of code.",
    author: "Mia Chen",
    date: "July 10, 2026",
    readTime: "8 min read",
  },
  {
    emoji: "📊",
    tag: "Analytics",
    title: "Understanding Your Business Health Score",
    excerpt: "We built the Business Health Score to give founders a single number that reflects the state of their startup across key dimensions.",
    author: "Jordan Park",
    date: "July 5, 2026",
    readTime: "6 min read",
  },
  {
    emoji: "🎨",
    tag: "Creators",
    title: "How Content Creators Are Using AI to Scale Output",
    excerpt: "Real stories from creators using Voxora's Marketing Studio to generate weeks of content in a single session.",
    author: "Emma Walsh",
    date: "June 28, 2026",
    readTime: "4 min read",
  },
  {
    emoji: "💰",
    tag: "Finance",
    title: "Cash Flow Planning for Early-Stage Startups",
    excerpt: "A deep dive into how the Financial Studio helps founders model their burn rate, runway, and break-even point without a spreadsheet.",
    author: "Sofia Torres",
    date: "June 20, 2026",
    readTime: "7 min read",
  },
  {
    emoji: "🏦",
    tag: "Fundraising",
    title: "Preparing Your Pitch Deck with AI",
    excerpt: "The Investor Studio's Pitch Deck Generator helps you craft a compelling narrative aligned with what investors actually want to see.",
    author: "Liam Nguyen",
    date: "June 12, 2026",
    readTime: "6 min read",
  },
];

const CATEGORIES = ["All", "Product", "Founders", "Analytics", "Creators", "Finance", "Fundraising"];

export default function Blog() {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState("All");

  const filtered = activeTag === "All" ? POSTS : POSTS.filter((p) => p.tag === activeTag);

  return (
    <div className="pub-page">
      <PublicNav />

      {/* Hero */}
      <section className="pub-hero">
        <p className="pub-hero-label">✦ VOXORA BLOG</p>
        <h1>Insights for Builders</h1>
        <p>Product updates, founder stories, and deep dives into AI-powered business building.</p>
      </section>

      {/* Filter */}
      <section className="pub-section bg-gray">
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTag(cat)}
              style={{
                padding: "7px 18px",
                borderRadius: 20,
                border: "1.5px solid",
                borderColor: activeTag === cat ? "#6C63FF" : "#e5e7eb",
                background: activeTag === cat ? "#6C63FF" : "#fff",
                color: activeTag === cat ? "#fff" : "#374151",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="pub-blog-grid">
          {filtered.map((post) => (
            <div className="pub-blog-card" key={post.title} onClick={() => navigate("/blog")}>
              <div className="pub-blog-card-img">{post.emoji}</div>
              <div className="pub-blog-card-body">
                <div className="pub-blog-card-tag">{post.tag}</div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="pub-blog-card-meta">
                  {post.author} · {post.date} · {post.readTime}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="pub-cta">
        <h2>Stay in the Loop</h2>
        <p>Get the latest product updates and founder insights delivered to your inbox.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", maxWidth: 440, margin: "0 auto" }}>
          <input
            type="email"
            placeholder="you@example.com"
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 12, border: "none",
              fontSize: 14, minWidth: 200, outline: "none", fontFamily: "inherit",
            }}
          />
          <button className="btn-white" style={{ whiteSpace: "nowrap" }}>Subscribe →</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
