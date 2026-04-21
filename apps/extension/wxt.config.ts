import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Scribe.ai',
    description: 'Save jobs and auto-tailor resumes directly from job boards.',
    permissions: ['storage', 'activeTab', 'tabs', 'scripting'],
    host_permissions: [
      '*://*.linkedin.com/*',
      '*://*.indeed.com/*'
    ]
  },
  srcDir: 'src',
});
