import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

export default function PrivacyPolicy() {
  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero" style={{ padding: "60px 40px" }}>
        <p className="pub-hero-label">✦ LEGAL</p>
        <h1>Privacy Policy</h1>
        <p>Your privacy matters to us. Here's how we handle your data.</p>
      </section>

      <div style={{ background: "#fff", flex: 1 }}>
        <div className="pub-prose">
          <p className="pub-prose-date">Last updated: July 19, 2026</p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to Voxora ("we", "our", or "us"). This Privacy Policy explains how we collect,
            use, and protect information about you when you use our platform at voxora.ai.
            By using Voxora, you agree to the practices described in this policy.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>Information You Provide</h3>
          <p>We may collect information you provide directly, including:</p>
          <ul>
            <li>Account information (name, email address, password) when you register</li>
            <li>Profile information such as your name and preferences</li>
            <li>Content you create within the platform (projects, notes, AI conversations)</li>
            <li>Communications you send us, including support requests</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <p>When you use Voxora, we may automatically collect:</p>
          <ul>
            <li>Usage data (features used, pages visited, time spent)</li>
            <li>Device information (browser type, operating system)</li>
            <li>Log data (IP address, access times, referring URLs)</li>
          </ul>

          <h3>Local Storage</h3>
          <p>
            On the free plan, all your project data, conversations, and settings are stored
            locally in your browser using localStorage. This data never leaves your device
            unless you explicitly export it.
          </p>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve the Voxora platform</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Detect and prevent fraudulent or harmful activity</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share information with:
          </p>
          <ul>
            <li><strong>Service providers</strong> who help us operate the platform (e.g., hosting, analytics)</li>
            <li><strong>Law enforcement</strong> when required by law or to protect our rights</li>
            <li><strong>Business partners</strong> with your explicit consent</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information,
            including encryption in transit (TLS) and at rest. However, no method of
            transmission over the internet is 100% secure.
          </p>

          <h2>6. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Object to or restrict certain processing</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p>To exercise these rights, contact us at privacy@voxora.ai.</p>

          <h2>7. Cookies</h2>
          <p>
            We use essential cookies to keep you logged in and remember your preferences.
            We do not use advertising or tracking cookies. You can control cookies through
            your browser settings.
          </p>

          <h2>8. Children's Privacy</h2>
          <p>
            Voxora is not directed to children under 13. We do not knowingly collect
            personal information from children. If you believe we have collected information
            from a child, please contact us immediately.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of
            significant changes by email or through a notice on our website. Your continued
            use of Voxora after changes constitutes acceptance of the updated policy.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
            <br />
            <strong>privacy@voxora.ai</strong>
            <br />
            Voxora, Inc. · Remote-first company
          </p>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
