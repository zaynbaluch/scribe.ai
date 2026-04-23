import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Scribe.ai',
    description: 'Save jobs and auto-tailor resumes directly from job boards.',
    permissions: ['storage', 'activeTab', 'tabs', 'scripting'],
    action: {
      default_icon: 'logo.png',
    },
    icons: {
      '16': 'logo.png',
      '32': 'logo.png',
      '48': 'logo.png',
      '128': 'logo.png',
    },
    host_permissions: [
      '*://*.linkedin.com/*',
      '*://*.indeed.com/*'
    ]
  },
  srcDir: 'src',
  dev: {
    server: {
      port: 3002,
    },
  },
});
