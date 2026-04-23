import { useState, useEffect } from 'react';
import { Briefcase, Link, Check, LogOut, Search, MapPin, Building, FileText, Loader2, ExternalLink, Sparkles } from 'lucide-react';

interface JobData {
  title: string;
  company: string;
  location: string;
  rawDescription: string;
  url: string;
  source: string;
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [scannedJob, setScannedJob] = useState<JobData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    browser.storage.local.get('scribe_access_token').then(res => {
      if (res.scribe_access_token) setToken(res.scribe_access_token);
    });
  }, []);

  const handleSaveToken = () => {
    if (!inputToken.trim()) return;
    browser.storage.local.set({ scribe_access_token: inputToken.trim() }).then(() => {
      setToken(inputToken.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    });
  };

  const handleLogout = () => {
    browser.storage.local.remove('scribe_access_token').then(() => {
      setToken(null);
      setInputToken('');
      setScannedJob(null);
    });
  };

  const scanJob = async () => {
    setIsScanning(true);
    setError(null);
    setScannedJob(null);

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab found');

      // Check if we are on supported site
      const url = tab.url || '';
      const isLinkedIn = url.includes('linkedin.com/jobs');
      const isIndeed = url.includes('indeed.com/viewjob') || url.includes('indeed.com/jobs');
      
      if (!isLinkedIn && !isIndeed) {
        throw new Error('Please open a job on LinkedIn or Indeed to scan.');
      }

      // Try to ping the content script to ensure it's loaded
      try {
        await browser.tabs.sendMessage(tab.id, { action: 'PING' });
      } catch (e) {
        throw new Error('Connection lost. Please refresh the page and try again.');
      }

      const response = await browser.tabs.sendMessage(tab.id, { action: 'SCAN_JOB' });
      if (response.success) {
        setScannedJob(response.jobData);
      } else {
        throw new Error(response.error || 'Failed to detect job details.');
      }
    } catch (err: any) {
      if (err.message.includes('Could not establish connection') || err.message.includes('Receiving end does not exist')) {
        setError('Connection lost. Please refresh the LinkedIn/Indeed page and try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const saveJobAndTailor = async () => {
    if (!scannedJob) return;
    setIsSaving(true);
    setError(null);

    try {
      const response = await browser.runtime.sendMessage({ 
        action: 'SAVE_JOB', 
        jobData: scannedJob 
      });
      
      if (response.success) {
        setIsSaved(true);
        // Redirect to tailoring page with the new jobId
        const jobId = response.data.id;
        const tailorUrl = `http://localhost:3000/tailor?jobId=${jobId}`;
        browser.tabs.create({ url: tailorUrl });
        
        setTimeout(() => {
          setIsSaved(false);
          setScannedJob(null);
        }, 2000);
      } else {
        throw new Error(response.error || 'Failed to save job.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[450px] bg-[#050508] text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg mb-6">
          <img src="/logo.png" alt="Scribe.ai" className="w-10 h-10 object-contain" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Connect Scribe.ai</h2>
        <p className="text-xs text-[#a1a1aa] mb-8 max-w-[240px]">Paste your access token from the dashboard settings to link the extension.</p>
        
        <div className="w-full space-y-4">
          <input 
            type="password" 
            value={inputToken} 
            onChange={e => setInputToken(e.target.value)}
            placeholder="Enter access token..."
            className="w-full px-4 py-3 rounded-xl bg-[#111114] border border-white/10 text-sm focus:outline-none focus:border-[#FF3366] transition-all placeholder:text-[#52525b]"
          />
          
          <button 
            onClick={handleSaveToken}
            disabled={!inputToken}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#FF3366] to-[#7C3AED] text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSaved ? <Check size={18} /> : <Link size={18} />}
            {isSaved ? 'Linked Successfully!' : 'Link Account'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[450px] bg-[#050508] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0c]">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Scribe" className="w-6 h-6 object-contain" />
          <span className="font-bold text-sm tracking-tight">Scribe.ai</span>
        </div>
        <button onClick={handleLogout} className="p-1.5 text-[#a1a1aa] hover:text-white rounded-lg hover:bg-white/5 transition-colors">
          <LogOut size={14} />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {!scannedJob ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-[#FF3366]/10 blur-xl animate-pulse" />
              <Search size={32} className="text-[#FF3366] relative z-10" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Scan Job Posting</h3>
            <p className="text-xs text-[#a1a1aa] mb-8 max-w-[200px] leading-relaxed">
              Open a job on LinkedIn or Indeed and click scan to capture details.
            </p>
            
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 w-full">
                {error}
              </div>
            )}

            <button 
              onClick={scanJob}
              disabled={isScanning}
              className="px-8 py-3 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              {isScanning ? 'Scanning...' : 'Scan Now'}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FF3366]/10 border border-[#FF3366]/20 text-[10px] font-bold text-[#FF3366] uppercase tracking-wider">
                <Check size={10} /> Job Detected
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-bold leading-tight line-clamp-2">{scannedJob.title}</h2>
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                    <Building size={14} className="text-[#FF3366]" />
                    <span className="font-medium text-white">{scannedJob.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                    <MapPin size={14} className="text-[#FF3366]" />
                    <span>{scannedJob.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-widest">
                  <span>Job Description</span>
                  <FileText size={12} />
                </div>
                <p className="text-[11px] text-[#a1a1aa] line-clamp-4 leading-relaxed italic">
                  "{scannedJob.rawDescription.substring(0, 150)}..."
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
            <button 
                onClick={saveJobAndTailor}
                disabled={isSaving}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#FF3366] to-[#7C3AED] text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : isSaved ? <Check size={18} /> : <Sparkles size={18} />}
                {isSaving ? 'Preparing AI...' : isSaved ? 'Redirecting...' : 'Tailor with AI'}
              </button>
              
              <button 
                onClick={() => setScannedJob(null)}
                disabled={isSaving}
                className="w-full py-3 rounded-xl text-sm font-medium text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5 bg-[#0a0a0c] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-medium text-[#71717a] uppercase tracking-widest">Ready to scan</span>
        </div>
        <a 
          href="http://localhost:3000/dashboard" 
          target="_blank" 
          className="text-[10px] font-bold text-[#FF3366] hover:underline flex items-center gap-1"
        >
          GO TO DASHBOARD <ExternalLink size={10} />
        </a>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
