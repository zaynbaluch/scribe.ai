import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
  console.log('Scribe.ai Background script loaded');

  // Listen for messages from content scripts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'SAVE_JOB') {
      saveJob(message.jobData)
        .then(response => sendResponse({ success: true, data: response }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // Indicate async response
    }
  });
});

async function saveJob(jobData: any) {
  const { token } = await browser.storage.local.get('scribe_access_token');
  if (!token) {
    throw new Error('Not logged in. Please log in via the extension popup.');
  }

  const API_URL = 'http://localhost:3001/api'; // In prod this would be process.env.VITE_API_URL

  const res = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      url: jobData.url,
      rawDescription: jobData.rawDescription,
      source: jobData.source
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error?.message || `Failed to save job (${res.status})`);
  }

  return res.json();
}
