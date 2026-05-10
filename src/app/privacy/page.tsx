export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            At Soul Space, we take your privacy extremely seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when
            you use our platform. Please read this privacy policy carefully. If you do
            not agree with the terms of this privacy policy, please do not access the
            platform.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (email, password)</li>
            <li>Profile information (nickname, avatar)</li>
            <li>Content you post on the platform</li>
            <li>Communications with other users and consultants</li>
            <li>Booking and payment information</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Protect the safety and security of our users</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Anonymity and Pseudonymity</h2>
          <p>
            Soul Space is designed to protect your identity. When you interact with the
            platform, you use a unique nickname that is not linked to your real identity.
            Your email address is used only for authentication and is never displayed
            publicly.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to
            protect your personal information. However, please note that no method of
            transmission over the Internet or electronic storage is 100% secure.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Export your data</li>
            <li>Opt-out of certain data uses</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            privacy@soulspace.com
          </p>
        </div>
      </div>
    </div>
  );
}
