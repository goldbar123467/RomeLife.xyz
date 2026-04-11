import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [['html'], ['list']],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'on',
        video: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                browserName: 'chromium',
                viewport: { width: 1920, height: 1080 },
            },
        },
    ],
    webServer: {
        command: 'npx next dev -p 3000',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120000,
    },
});
