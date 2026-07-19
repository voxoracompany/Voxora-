import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

export default function TermsOfService() {
  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero" style={{ padding: "60px 40px" }}>
        <p className="pub-hero-label">✦ LEGAL</p>
        <h1>Terms of Service</h1>
        <p>Please read these terms carefully before using Voxora.</p>
      </section>

      <div style={{ background: "#fff", flex: 1 }}>
        <div className="pub-prose">
          <p className="pub-prose-date">Last updated: July 19, 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Voxora ("the Service"), you agree to be bound by these
            Terms of Service ("Terms"). If you do not agree to these Terms, please do not
            use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Voxora is an AI-powered business and creativity platform that provides tools
            for idea generation, market research, content creation, business planning,
            and related activities. The Service is provided "as is" and we reserve the
            right to modify, suspend, or discontinue it at any time.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            To access certain features, you may need to create an account. You are
            responsible for:
          </p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activity that occurs under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
            <li>Providing accurate and complete registration information</li>
          </ul>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Violate any applicable law or regulation</li>
            <li>Infringe the intellectual property rights of others</li>
            <li>Upload or transmit malicious code or harmful content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Generate content that is illegal, harmful, or deceptive</li>
            <li>Scrape or extract data from the Service without permission</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <h3>Your Content</h3>
          <p>
            You retain ownership of all content you create using Voxora. By using the
            Service, you grant us a limited license to store and process your content
            solely for the purpose of providing the Service.
          </p>
          <h3>Our Content</h3>
          <p>
            The Voxora platform, including its design, code, and features, is owned by
            Voxora, Inc. and protected by intellectual property laws. You may not copy,
            modify, or distribute our proprietary materials without permission.
          </p>

          <h2>6. Payment and Billing</h2>
          <p>
            The Free plan is available at no cost. Pro and Enterprise plans are billed
            on a subscription basis. By subscribing to a paid plan:
          </p>
          <ul>
            <li>You authorize us to charge your payment method</li>
            <li>Subscriptions renew automatically unless cancelled</li>
            <li>Refunds are available within 14 days of purchase</li>
            <li>Prices may change with 30 days notice</li>
          </ul>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM
            ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, VOXORA SHALL NOT BE LIABLE FOR
            ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            OR ANY LOSS OF PROFITS OR DATA, ARISING OUT OF YOUR USE OF THE SERVICE.
          </p>

          <h2>9. Termination</h2>
          <p>
            We may suspend or terminate your account at any time if you violate these
            Terms. You may cancel your account at any time from your account settings.
            Upon termination, your right to use the Service ceases immediately.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware, United States,
            without regard to conflict of law principles. Any disputes shall be resolved
            in the courts of Delaware.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued use of the Service after
            changes constitutes acceptance of the updated Terms. We will provide notice
            of material changes via email or in-app notification.
          </p>

          <h2>12. Contact</h2>
          <p>
            Questions about these Terms? Contact us at:
            <br />
            <strong>legal@voxora.ai</strong>
            <br />
            Voxora, Inc. · Remote-first company
          </p>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
