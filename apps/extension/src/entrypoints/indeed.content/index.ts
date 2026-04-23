import { defineContentScript } from 'wxt/sandbox';
import './style.css';

export default defineContentScript({
  matches: ['*://*.indeed.com/viewjob*', '*://*.indeed.com/jobs*', '*://*.indeed.com/m/viewjob*'],
  main() {
    console.log('Scribe.ai Indeed script injected');

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Scribe.ai message received:', message);

      if (message.action === 'PING') {
        sendResponse({ success: true });
        return true;
      }

      if (message.action === 'SCAN_JOB') {
        try {
          const jobData = scrapeIndeedJob();
          console.log('Scribe.ai scraped data:', jobData);
          if (!jobData.title) {
            sendResponse({ success: false, error: 'No job details found on this page. Make sure a job is selected.' });
          } else {
            sendResponse({ success: true, jobData });
          }
        } catch (err: any) {
          console.error('Scribe.ai scrape error:', err);
          sendResponse({ success: false, error: err.message });
        }
      }
      return true;
    });
  },
});



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
