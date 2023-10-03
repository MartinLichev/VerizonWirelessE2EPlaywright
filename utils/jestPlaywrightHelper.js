const {
    chromium,
    firefox,
    webkit
} = require('playwright');
const config = require('../config.json');

class JestPlaywrightHelper {
    constructor() {
        // Use the browserType from config.json or fallback to 'chromium' if no CLI argument is provided
        this.browserType = config.browserType || process.argv[2] || 'chromium';
        this.timeout = config.timeout;
        this.baseUrl = config.baseUrl;
    }

    async createBrowser() {
        if (this.browserType === 'chromium') {
            this.browser = await chromium.launch();
        } else if (this.browserType === 'firefox') {
            this.browser = await firefox.launch();
        } else if (this.browserType === 'webkit') {
            this.browser = await webkit.launch();
        } else {
            throw new Error('Invalid browser type');
        }
        this.context = await this.browser.newContext();
        this.page = await this.context.newPage();
    }

    async goto(relativePath = '') {
        // Use baseUrl and timeout from config.json
        await this.page.goto(`${this.baseUrl}${relativePath}`, { timeout: this.timeout });
    }

    async click(selector) {
        await this.page.click(selector);
    }

    async type(selector, text) {
        await this.page.fill(selector, text);
    }

    async getText(selector) {
        return await this.page.textContent(selector);
    }

    async takeScreenshot(path) {
        await this.page.screenshot({
            path
        });
    }

    async getAllCookies() {
        return await this.context.cookies();
    }

    async addCookie(name, value) {
        await this.context.addCookies([{
            name,
            value
        }]);
    }

    async deleteCookie(name) {
        const cookies = await this.context.cookies();
        const cookie = cookies.find((c) => c.name === name);
        if (cookie) {
            await this.context.clearCookies();
        }
    }

    async dragAndDrop(sourceSelector, targetSelector) {
        const source = await this.page.$(sourceSelector);
        const target = await this.page.$(targetSelector);
        const sourceBB = await source.boundingBox();
        const targetBB = await target.boundingBox();

        await this.page.mouse.move(sourceBB.x + sourceBB.width / 2, sourceBB.y + sourceBB.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(targetBB.x + targetBB.width / 2, targetBB.y + targetBB.height / 2);
        await this.page.mouse.up();
    }

    async hover(selector) {
        await this.page.hover(selector);
    }

    async executeScript(script, ...args) {
        return await this.page.evaluate(script, ...args);
    }

    async getElementCount(selector) {
        const elements = await this.page.$$(selector);
        return elements.length;
    }

    async getAttribute(selector, attrName) {
        const element = await this.page.$(selector);
        return await element.getAttribute(attrName);
    }

    async getCssValue(selector, property) {
        const element = await this.page.$(selector);
        return await this.page.evaluate((el, prop) => getComputedStyle(el)[prop], element, property);
    }

    async scrollToElement(selector) {
        const element = await this.page.$(selector);
        await element.scrollIntoViewIfNeeded();
    }

    async acceptAlert() {
        const dialog = await this.page.waitForEvent('dialog');
        await dialog.accept();
    }

    async dismissAlert() {
        const dialog = await this.page.waitForEvent('dialog');
        await dialog.dismiss();
    }

    async getAlertText() {
        const dialog = await this.page.waitForEvent('dialog');
        return dialog.message();
    }

    async switchToFrame(nameOrId) {
        const frame = await this.page.frame({
            name: nameOrId
        });
        if (frame) {
            this.page = frame;
        }
    }

    async switchToDefault() {
        this.page = this.context.page();
    }

    async uploadFile(selector, filePath) {
        const input = await this.page.$(selector);
        await input.setInputFiles(filePath);
    }

    async downloadFile(downloadPath) {
        await this.page._setFileChooserIntercepted(true);
        await this.page.waitForEvent('filechooser').then(async (filechooser) => {
            await filechooser.setFiles(downloadPath);
        });
    }

    async closeBrowser() {
        await this.browser.close();
    }
}

module.exports = JestPlaywrightHelper;