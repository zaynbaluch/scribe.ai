import { defineContentScript } from 'wxt/sandbox';
import './style.css';

export default defineContentScript({
  matches: ['*://*.indeed.com/viewjob*', '*://*.indeed.com/jobs*'],
  main() {
    console.log('Scribe.ai Indeed script injected');

    const observer = new MutationObserver(() => {
      // Indeed job view header container
      const jobTitleContainer = document.querySelector('.jobsearch-JobInfoHeader-title-container, h1.jobsearch-JobInfoHeader-title');
      if (jobTitleContainer && !document.querySelector('#scribe-save-btn-indeed')) {
        injectButton(jobTitleContainer);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  },
});

function injectButton(anchorEl: Element) {
  const container = document.createElement('div');
  container.id = 'scribe-save-btn-indeed';
  container.style.marginTop = '10px';
  container.style.marginBottom = '15px';

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
      const jobData = scrapeIndeedJob();
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
  
  // Insert near title
  if (anchorEl.parentElement) {
    anchorEl.parentElement.insertBefore(container, anchorEl.nextSibling);
  }
}

function scrapeIndeedJob() {
  const title = document.querySelector('h1.jobsearch-JobInfoHeader-title span')?.textContent?.trim() || '';
  const company = document.querySelector('[data-company-name="true"]')?.textContent?.trim() || '';
  const location = document.querySelector('#jobLocationText')?.textContent?.trim() || '';
  const rawDescription = document.querySelector('#jobDescriptionText')?.textContent?.trim() || '';

  return {
    title,
    company,
    location,
    rawDescription,
    url: window.location.href,
    source: 'indeed'
  };
}
