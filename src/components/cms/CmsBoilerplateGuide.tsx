import React, { useState } from 'react';
import { Package, Terminal, Database, Globe, Shield, Code, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';

export default function CmsBoilerplateGuide() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const sdkCode = `// cms-client.ts - Headless Client SDK for any website/webapp
const API_BASE = '/api';

export const cmsClient = {
  async getHomepage() {
    const res = await fetch(\`\${API_BASE}/public/homepage\`);
    if (!res.ok) throw new Error('Failed to load homepage');
    return res.json();
  },
  async getPageBySlug(slug: string) {
    const res = await fetch(\`\${API_BASE}/public/pages/\${slug}\`);
    if (!res.ok) throw new Error('Page not found');
    return res.json();
  },
  async getArticles() {
    const res = await fetch(\`\${API_BASE}/public/articles\`);
    return res.json();
  },
  async getNavigation() {
    const res = await fetch(\`\${API_BASE}/public/navigation\`);
    return res.json();
  },
  async getSettings() {
    const res = await fetch(\`\${API_BASE}/public/settings\`);
    return res.json();
  },
  async submitInquiry(data: { name: string; email: string; message: string; service?: string; budget?: string }) {
    const res = await fetch(\`\${API_BASE}/public/inquiries\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }
};`;

  const envCode = `# .env - Production Boilerplate Environment Variables
PORT=3000
NODE_ENV=production
AUTH_SECRET=your_super_secret_auth_token_key_here
CMS_ADMIN_USERNAME=admin
CMS_ADMIN_EMAIL=admin@youragency.com
CMS_ADMIN_PASSWORD=your_secure_initial_password

# Optional: Resend for email notifications
RESEND_API_KEY=re_YourResendApiKey
CMS_EMAIL_SENDER=Your Agency <onboarding@resend.dev>

# Optional: Supabase for cloud database sync
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key`;

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#df0567]/20 text-[#df0567] border border-[#df0567]/30">
            Boilerplate &amp; SaaS Productization Manual
          </span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Package className="w-8 h-8 text-[#df0567]" />
          <span>Turn This CMS into a Reusable Product</span>
        </h2>
        <p className="text-sm text-white/60 mt-1 max-w-2xl">
          Follow this blueprint to quickly deploy this modular React &amp; Node.js CMS as a starter kit or headless backend for any client website, SaaS web app, or agency project.
        </p>
      </div>

      {/* Quick Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#131317] border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">1. Modular Backend</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Express API (`server.ts`, `api.ts`) managing authentication, RBAC, atomic file store, and Supabase cloud sync out-of-the-box.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131317] border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#df0567]/10 text-[#df0567] flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">2. Admin Dashboard</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Full-featured CMS panel (`/cms`) for visual page building, media management, SEO defaults, team permissions, and live activity audit logs.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#131317] border border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">3. Headless SDK</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Plug-and-play client library (`cms-client.ts`) allowing any frontend React, Next.js, or static site to consume structured content instantly.
          </p>
        </div>
      </div>

      {/* Step-by-Step Guide */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#df0567]" />
          <span>Step-by-Step Deployment &amp; Usage Guide</span>
        </h3>

        {/* Step 1 */}
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#df0567] text-white flex items-center justify-center text-xs font-bold">1</span>
              <h4 className="text-base font-bold text-white">Save as a GitHub Template / Fork Repo</h4>
            </div>
            <span className="text-xs font-mono text-white/40">Repository Setup</span>
          </div>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            To use this as a boilerplate for future client projects, mark this repository as a <b>Template Repository</b> on GitHub. Whenever you start a new website, click <span className="text-[#df0567] font-semibold">"Use this template"</span> to spin up an identical, fully-configured CMS repository in seconds.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#df0567] text-white flex items-center justify-center text-xs font-bold">2</span>
              <h4 className="text-base font-bold text-white">Configure Environment Variables</h4>
            </div>
            <span className="text-xs font-mono text-white/40">.env Setup</span>
          </div>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Create a `.env` file in your project root with your credentials and secure admin login details:
          </p>

          <div className="relative group">
            <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto">
              <code>{envCode}</code>
            </pre>
            <button
              onClick={() => handleCopy(envCode, 'env')}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'env' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#df0567] text-white flex items-center justify-center text-xs font-bold">3</span>
              <h4 className="text-base font-bold text-white">Integrate the Headless Client SDK</h4>
            </div>
            <span className="text-xs font-mono text-white/40">Frontend Consumption</span>
          </div>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Import the CMS data helpers into your website frontend to fetch published pages, dynamic sections, and SEO metadata:
          </p>

          <div className="relative group">
            <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto max-h-64">
              <code>{sdkCode}</code>
            </pre>
            <button
              onClick={() => handleCopy(sdkCode, 'sdk')}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSection === 'sdk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'sdk' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#df0567] text-white flex items-center justify-center text-xs font-bold">4</span>
              <h4 className="text-base font-bold text-white">Scaling to Multi-Tenant SaaS (Optional)</h4>
            </div>
            <span className="text-xs font-mono text-white/40">SaaS Architecture</span>
          </div>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            To offer this CMS as a SaaS product where clients pay a monthly subscription:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-white/70">
            <li>Add a <code className="text-[#df0567]">tenant_id</code> foreign key column to all database models in <code className="text-white/90">src/server/db.ts</code>.</li>
            <li>Use subdomains (<code className="text-[#df0567]">clientname.yourproduct.com</code>) to route incoming Express requests to the corresponding tenant database.</li>
            <li>Integrate Stripe Billing via webhook to automatically provision and activate tenant instances upon checkout.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
