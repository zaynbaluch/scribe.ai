import { defineContentScript } from 'wxt/sandbox';
import './style.css';

export default defineContentScript({
  matches: ['*://*.linkedin.com/jobs/view/*', '*://*.linkedin.com/jobs/collections/*'],
  main() {
    console.log('Scribe.ai LinkedIn script injected');

    // Setup an observer to watch for job detail container
    const observer = new MutationObserver(() => {
      const jobTitleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title, .t-24.t-bold');
      if (jobTitleEl && !document.querySelector('#scribe-save-btn')) {
        injectButton(jobTitleEl);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
});

function injectButton(anchorEl: Element) {
  const container = document.createElement('div');
  container.id = 'scribe-save-btn';
  container.style.marginTop = '10px';
  container.style.marginBottom = '10px';

  const btn = document.createElement('button');
  btn.className = 'scribe-btn';
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
    Save to Scribe.ai
  `;

  btn.onclick = async () => {
    btn.disabled = true;
    btn.innerHTML = 'Saving...';
    
    try {
      const jobData = scrapeLinkedInJob();
      const response = await browser.runtime.sendMessage({ action: 'SAVE_JOB', jobData });
      
      if (response.success) {
        btn.innerHTML = '✓ Saved!';
        btn.style.background = '#10b981';
      } else {
        throw new Error(response.error);
      }
    } catch (err: any) {
      alert(`Scribe.ai Error: ${err.message}`);
      btn.innerHTML = 'Save to Scribe.ai';
      btn.disabled = false;
    }
  };

  container.appendChild(btn);
  
  // Insert near the title
  if (anchorEl.parentElement) {
    anchorEl.parentElement.appendChild(container);
  }
}

function scrapeLinkedInJob() {
  const title = document.querySelector('.job-details-jobs-unified-top-card__job-title, .t-24.t-bold')?.textContent?.trim() || '';
  const company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__primary-description a')?.textContent?.trim() || '';
  
  // Location can be tricky, usually next to company
  let location = '';
  const locationEl = document.querySelector('.job-details-jobs-unified-top-card__primary-description span:nth-child(2)');
  if (locationEl) location = locationEl.textContent?.trim() || '';

  const descriptionEl = document.querySelector('#job-details, .jobs-description__content');
  const rawDescription = descriptionEl?.textContent?.trim() || '';

  return {
    title,
    company,
    location,
    rawDescription,
    url: window.location.href,
    source: 'linkedin'
  };
}
