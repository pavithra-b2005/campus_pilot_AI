import React, { useState } from 'react';
import { X, Github, Download, Copy, Check, Terminal, FileCode, ExternalLink, ShieldCheck } from 'lucide-react';
import { listTasks, getActivePlan } from '../services/taskService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleExportDataJSON = () => {
    const backup = {
      appName: 'CampusPilot AI',
      exportedAt: new Date().toISOString(),
      tasks: listTasks(),
      activeStudyPlan: getActivePlan(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campuspilot-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const gitSnippet = `# 1. Initialize local Git repository
git init

# 2. Add all project files
git add .

# 3. Commit the verified codebase
git commit -m "feat: CampusPilot AI - University student productivity agent with approval-based workflow"

# 4. Set main branch and link to your GitHub repo
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/campuspilot-ai.git

# 5. Push to GitHub
git push -u origin main`;

  const runSnippet = `# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/campuspilot-ai.git
cd campuspilot-ai

# 2. Install dependencies
npm install

# 3. Configure Gemini API key (optional for local demo)
cp .env.example .env
# Add GEMINI_API_KEY="your-gemini-api-key" to .env

# 4. Start local development server
npm run dev`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-[#111728] border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#141B30]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export & GitHub Guide</h3>
              <p className="text-xs text-slate-400">
                Instructions for pushing CampusPilot AI to GitHub and running locally.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Quick backup button */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-cyan-500/30 flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-white flex items-center gap-1.5 text-sm">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export Application Data Backup</span>
              </h4>
              <p className="text-slate-400 mt-0.5">
                Download your current tasks, completed items, and study plans as formatted JSON.
              </p>
            </div>
            <button
              onClick={handleExportDataJSON}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Git Push Guide */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Publish to GitHub</span>
              </h4>
              <button
                onClick={() => handleCopy(gitSnippet, 'git')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
              >
                {copiedSection === 'git' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Commands</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-[#090D17] border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              {gitSnippet}
            </pre>
          </div>

          {/* Local Run Guide */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>Clone & Run Locally</span>
              </h4>
              <button
                onClick={() => handleCopy(runSnippet, 'run')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
              >
                {copiedSection === 'run' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Setup</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-[#090D17] border border-white/10 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              {runSnippet}
            </pre>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-[#0E1424] border border-emerald-500/20 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-slate-300">
              <strong className="text-white">Security & API Keys:</strong> API keys are read securely on the server via <code className="text-cyan-300 font-mono">process.env.GEMINI_API_KEY</code>. The <code className="text-cyan-300 font-mono">.gitignore</code> file automatically excludes <code className="text-cyan-300 font-mono">.env</code>, so your secrets are never committed to GitHub.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-[#141B30] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
