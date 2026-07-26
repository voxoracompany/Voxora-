import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

export default function CookiePolicy() {
  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero" style={{ padding: "60px 40px" }}>
        <p className="pub-hero-label">✦ LEGAL</p>
        <h1>Cookie Policy</h1>
        <p>How Voxora uses cookies and similar technologies on our platform.</p>
      </section>

      <div style={{ background: "#fff", flex: 1 }}>
        <div className="pub-prose">
          <p className="pub-prose-date">Last updated: July 26, 2026</p>

          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device by your browser when you visit
            a website. They are widely used to make websites work efficiently, remember your
            preferences, and provide basic analytics information to site owners.
          </p>

          <h2>2. How Voxora Uses Cookies</h2>
          <p>
            Voxora uses a minimal set of cookies necessary to operate the platform. We do
            <strong> not</strong> use advertising cookies, third-party tracking cookies, or
            any cookies that share your data with advertisers.
          </p>

          <h3>Essential Cookies</h3>
          <p>
            These cookies are required for the platform to function. Without them, services
            you have asked for cannot be provided.
          </p>
          <ul>
            <li>
              <strong>Session cookie</strong> — keeps you logged in during a browser session.
              Expires when you close the browser.
            </li>
            <li>
              <strong>CSRF token</strong> — protects form submissions from cross-site request
              forgery. Expires with the session.
            </li>
            <li>
              <strong>Theme preference</strong> — remembers your light/dark mode choice.
              Stored in localStorage, not a cookie.
            </li>
          </ul>

          <h3>Functional Cookies</h3>
          <p>
            These cookies enable enhanced functionality and personalisation. They may be set
            by us or by third-party providers whose services we use.
          </p>
          <ul>
            <li>
              <strong>Auth token</strong> — if you choose cloud sync, a secure token
              authenticates your account. Expires in 30 days or on sign-out.
            </li>
          </ul>

          <h3>Analytics (Local Only)</h3>
          <p>
            In Demo Mode, Voxora stores usage metrics only in your browser's localStorage.
            This data never leaves your device and is not associated with any external
            analytics service unless you opt in to cloud analytics.
          </p>

          <h2>3. Cookies We Do Not Use</h2>
          <ul>
            <li>Advertising or retargeting cookies</li>
            <li>Social media tracking pixels (Facebook, Twitter, etc.)</li>
            <li>Third-party behavioural analytics (e.g. Google Analytics, Mixpanel) unless
              explicitly enabled by you</li>
            <li>Cross-site tracking cookies</li>
          </ul>

          <h2>4. Managing Cookies</h2>
          <p>
            You can control and delete cookies through your browser settings. Most browsers
            allow you to:
          </p>
          <ul>
            <li>View what cookies are stored and delete them individually</li>
            <li>Block third-party cookies</li>
            <li>Block cookies from particular sites</li>
            <li>Block all cookies from being set</li>
            <li>Delete all cookies when you close the browser</li>
          </ul>
          <p>
            Be aware that deleting or blocking essential cookies will affect your ability to
            use Voxora — for example, you may not be able to stay logged in.
          </p>
          <p>
            Guidance for managing cookies in common browsers:
          </p>
          <ul>
            <li>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer"
                style={{ color: "#6C63FF" }}>Google Chrome</a>
            </li>
            <li>
              <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                target="_blank" rel="noopener noreferrer" style={{ color: "#6C63FF" }}>Mozilla Firefox</a>
            </li>
            <li>
              <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
                target="_blank" rel="noopener noreferrer" style={{ color: "#6C63FF" }}>Apple Safari</a>
            </li>
            <li>
              <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank" rel="noopener noreferrer" style={{ color: "#6C63FF" }}>Microsoft Edge</a>
            </li>
          </ul>

          <h2>5. localStorage and sessionStorage</h2>
          <p>
            In addition to cookies, Voxora makes use of <strong>localStorage</strong> and
            <strong> sessionStorage</strong> — browser-based storage mechanisms that are not
            transmitted to servers. We use them to:
          </p>
          <ul>
            <li>Save your projects, notes, and AI conversations in Demo Mode</li>
            <li>Remember UI preferences (theme, sidebar state)</li>
            <li>Cache AI responses to reduce repeat API calls</li>
          </ul>
          <p>
            You can clear this data at any time from your browser's developer tools or from
            the Settings → Data Management section inside the Voxora app.
          </p>

          <h2>6. Changes to This Policy</h2>
          <p>
            We may update this Cookie Policy periodically. When we do, we will revise the
            "last updated" date above. Continued use of Voxora after changes constitutes
            acceptance of the revised policy.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact:
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
