import { defineContentScript } from 'wxt/sandbox';
import './style.css';

export default defineContentScript({
  matches: ['*://*.linkedin.com/jobs/*', '*://*.linkedin.com/jobs/view/*', '*://*.linkedin.com/jobs/collections/*'],
  main() {
    console.log('Scribe.ai LinkedIn script injected');

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Scribe.ai message received:', message);
      
      if (message.action === 'PING') {
        sendResponse({ success: true });
        return true;
      }

      if (message.action === 'SCAN_JOB') {
        try {
          const jobData = scrapeLinkedInJob();
          console.log('Scribe.ai scraped data:', jobData);
          if (!jobData.title || !jobData.rawDescription) {
            const missing = !jobData.title ? 'Title' : 'Description';
            console.error(`Scribe.ai: Missing ${missing}`);
            sendResponse({ success: false, error: `Could not capture ${missing}. Please ensure the job is fully loaded and visible.` });
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



function scrapeLinkedInJob() {
  // Try multiple selectors for title
  const titleSelectors = [
    '.job-details-jobs-unified-top-card__job-title',
    '.top-card-layout__title',
    'h1.top-card-layout__title',
    '.jobs-unified-top-card__job-title',
    'h1.t-24',
    '.t-24.t-bold',
    'h2.t-24',
    'main h1',
    'h1'
  ];

  let title = '';
  for (const selector of titleSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent?.trim()) {
      title = el.textContent.trim();
      console.log(`Scribe.ai: Found title using selector: ${selector} -> "${title}"`);
      break;
    }
  }

  // Try multiple selectors for company
  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name',
    '.topcard__org-name-link',
    '.topcard__flavor--black-link',
    '.jobs-unified-top-card__company-name',
    '.job-details-jobs-unified-top-card__primary-description a',
    '.jobs-unified-top-card__primary-description a',
    '.top-card-layout__company-name',
    'a[href*="/company/"]'
  ];

  let company = '';
  for (const selector of companySelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent?.trim()) {
      company = el.textContent.trim();
      console.log(`Scribe.ai: Found company using selector: ${selector} -> "${company}"`);
      break;
    }
  }
  
  // Location
  let location = '';
  const locationEl = document.querySelector('.job-details-jobs-unified-top-card__primary-description span:nth-child(2), .jobs-unified-top-card__primary-description span:nth-child(2)');
  if (locationEl) location = locationEl.textContent?.trim() || '';

  // Exhaustive list of description selectors
  const descriptionSelectors = [
    '#job-details',
    '.jobs-description__content',
    '.jobs-description-content__text',
    '.show-more-less-html__markup',
    '.jobs-box__html-content',
    '.description__text',
    '.job-view-main-content'
  ];

  let rawDescription = '';
  for (const selector of descriptionSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent?.trim()) {
      rawDescription = el.textContent.trim();
      console.log(`Scribe.ai: Found description using selector: ${selector}`);
      break;
    }
  }

  // Aggressive fallback if still not found
  if (!rawDescription) {
    console.log('Scribe.ai: Specific selectors failed, trying aggressive fallback...');
    const containers = Array.from(document.querySelectorAll('div.relative, div.mt4, article, section'));
    const candidates = containers
      .map(el => ({
        el,
        text: el.textContent?.trim() || '',
        length: el.textContent?.trim().length || 0
      }))
      .filter(c => c.length > 500 && c.length < 15000 && (c.el as HTMLElement).offsetParent !== null)
      .sort((a, b) => b.length - a.length);

    if (candidates.length > 0) {
      rawDescription = candidates[0].text;
      console.log('Scribe.ai: Using fallback candidate with length:', candidates[0].length);
    }
  }

  return {
    title,
    company,
    location,
    rawDescription,
    url: window.location.href,
    source: 'linkedin'
  };
}
