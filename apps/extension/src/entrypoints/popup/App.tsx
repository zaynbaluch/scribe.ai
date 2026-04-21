import { useState, useEffect } from 'react';
import { Briefcase, Link, Check, LogOut } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    browser.storage.local.get('scribe_access_token').then(res => {
      if (res.scribe_access_token) setToken(res.scribe_access_token);
    });
  }, []);

  const handleSaveToken = () => {
    browser.storage.local.set({ scribe_access_token: inputToken }).then(() => {
      setToken(inputToken);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    });
  };

  const handleLogout = () => {
    browser.storage.local.remove('scribe_access_token').then(() => {
      setToken(null);
      setInputToken('');
    });
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-[400px]">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center text-white font-display font-bold text-xl mb-4">
          S
        </div>
        <h2 className="text-xl font-bold mb-2">Connect Scribe.ai</h2>
        <p className="text-sm text-[#a1a1aa] mb-6">Enter your access token from the dashboard to link this extension.</p>
        
        <input 
          type="password" 
          value={inputToken} 
          onChange={e => setInputToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1Ni..."
          className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-sm focus:outline-none focus:border-[#818cf8] mb-3"
        />
        
        <button 
          onClick={handleSaveToken}
          className="w-full py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white flex items-center justify-center gap-2"
        >
          {isSaved ? <Check size={16} /> : <Link size={16} />}
          {isSaved ? 'Linked!' : 'Link Account'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex items-center justify-between p-4 border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center text-white font-display font-bold text-[10px]">
            S
          </div>
          <span className="font-semibold text-sm">Scribe.ai</span>
        </div>
        <button onClick={handleLogout} className="p-1.5 text-[#a1a1aa] hover:text-white rounded hover:bg-[#27272a]">
          <LogOut size={14} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-4">
          <Briefcase size={24} className="text-[#818cf8]" />
        </div>
        <h3 className="font-medium mb-2">Extension Active</h3>
        <p className="text-xs text-[#a1a1aa]">
          Go to LinkedIn or Indeed to see the "Save to Scribe.ai" button on job postings.
        </p>
      </div>
      
      <div className="p-4 border-t border-[#27272a] bg-[#18181b] text-xs text-center text-[#71717a]">
        <a href="http://localhost:3000/dashboard" target="_blank" className="hover:text-white hover:underline">Open Dashboard ↗</a>
      </div>
    </div>
  );
}
