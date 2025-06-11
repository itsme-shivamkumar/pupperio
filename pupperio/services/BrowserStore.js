import {v4 as uuidv4} from 'uuid';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import cheerio from 'cheerio';
dotenv.config({ path: '../.env' });

const browserStore = new Map();

const  initializeBrowser = async (browserId) => {
    console.log("PROFILE: " + process.env.PROFILE);
    console.log(`Initializing browser with ID: ${browserId || 'new'}`);
    if(browserId && browserStore.has(browserId)) {
        return browserStore.get(browserId);
    }

    const browser = await puppeteer.launch({
        headless: process.env.PROFILE === "prod"
        ? true
        : false,
        args: [
          '--disable-setuid-sandbox',
          '--no-sandbox',
          '--single-process',
          '--no-zygote',    
      ],
        defaultViewport: null,
        executablePath: process.env.PROFILE === "prod"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath()
      });
    
    const pages = await browser.pages();
    const currPage = pages[0];
    const id = browserId || uuidv4();
    
    browserStore.set(id, {
        browser,
        pages,
        currPage,
        id,
        resourceFromBrowser: null
    });

    return browserStore.get(id);
}

const getBrowserContext = (browserId) => {
    if(browserStore.has(browserId)){
        return browserStore.get(browserId);
    }
    return null;
}

const openNewTab = async (browserContext) => {
    if(browserContext) {
        const newPage = await browserContext.browser.newPage();
        browserContext.pages.push(newPage);
        browserContext.currPage = newPage;
        return browserContext;
    } else {
        return {
            ...browserContext,
            resourceFromBrowser: `No browser context found for ID: ${browserContext.id}`
        }
    }
}

const gotoPage = async (browserContext, selector, url) => {
    if(browserContext && browserContext.currPage) {
        await browserContext.currPage.goto(url, { waitUntil: 'load', timeout: 120000 });
        if(selector != "" && selector != null) await browserContext.currPage.waitForSelector(selector);  
        return browserContext;
    } else {
        return {
            ...browserContext,
            resourceFromBrowser: `No active page found for browser ID: ${browserContext.id}`
        }
    }
}

const click = async (browserContext, selector) => {
    if(browserContext && browserContext.currPage) {
        await browserContext.currPage.click(selector, {waitUntil: 'load'});
        return browserContext;
    } else {
        return {
            ...browserContext,
            resourceFromBrowser: `No active page found for browser ID: ${browserContext.id}`
        }
    }
}

const type = async (browserContext, selector, text) => {
    if(browserContext && browserContext.currPage) {
        await browserContext.currPage.type(selector, text, {delay: 50});
        return browserContext;
    } else {
        return {
            ...browserContext,
            resourceFromBrowser: `No active page found for browser ID: ${browserContext.id}`
        }
    }
}

const extract = async (browserContext, selector,  type,  attributeName) => {
    if(browserContext && browserContext.currPage) {
        const result = await browserContext.currPage.evaluate((sel, type) => {
            const element = document.querySelector(sel);
            if (!element) return null;
            if (type === 'html') {
                return element.innerHTML;
            } else if (type === 'text') {
                return element.innerText;
            } else if (type === 'value') {
                return element.value;
            } else {
                return element.getAttribute(attributeName);
            }
        }, selector, type);
        browserContext.resourceFromBrowser = result;
        return browserContext;
    } else {
        return {
            ...browserContext,
            resourceFromBrowser: `No active page found for browser ID: ${browserContext.id}`
        }
    }
}

const cheerioScrape = async (browserContext, selector, type, attributeName) => {
    if(browserContext && browserContext.currPage) {
        const htmlContent = await browserContext.currPage.content();
        const $ = cheerio.load(htmlContent);
        let result;

        switch (type) {
          case 'html':
            result = $(selector).html();
            break;
          case 'text':
            result = $(selector).text();
            break;
          case 'value':
            result = $(selector).attr(type);
            break;
          case 'attr':
            result = $(selector).attr(attributeName);
            break;
          case 'children':
            result = $(selector).children().toArray().map(el => $(el).html());
            break;
          case 'parent':
            result = $(selector).parent().html();
            break;
          case 'siblings':
            result = $(selector).siblings().toArray().map(el => $(el).html());
            break;
          case 'next':
            result = $(selector).next().html();
            break;
          case 'prev':
            result = $(selector).prev().html();
            break;
          case 'list':
            result = $(selector).toArray().map(el => $(el).text());
            break;
          default:
            result = "No valid type found for the selector " + type;
        }

        browserContext.resourceFromBrowser = result;
        return browserContext;
    } else {
        return {
            ...browserContext,
            resourceFromBrowser: `No active page found for browser ID: ${browserContext.id}`
        }
    }
}

const switchTab = async (browserContext, tabIndex) => {
    if(browserContext && browserContext.pages[tabIndex]) {
        browserContext.currPage = browserContext.pages[tabIndex];
        return browserContext;
    } else {
        browserContext.resourceFromBrowser = `No tab found at index ${tabIndex} for browser ID: ${browserContext.id}`
        return browserContext;
    }
}

const closeTab = async (browserContext) => {
    if(browserContext && browserContext.currPage) {
        if(browserContext.pages.length <= 1) {
            browserContext.resourceFromBrowser = `Cannot close the last tab for browser ID: ${browserContext.id}`;
            return browserContext;
        }
        await browserContext.currPage.close();
        browserContext.pages = browserContext.pages.filter(page => page !== browserContext.currPage);
        browserContext.currPage = browserContext.pages.length > 0 ? browserContext.pages[0] : null;
        return browserContext;
    } else {
        return `No active page found for browser ID: ${browserContext.id}`;
    }
}

const screenshot = async (browserContext) => {
    if(browserContext && browserContext.currPage) {
        const screenshotBuffer = await browserContext.currPage.screenshot({ fullPage: true });
        browserContext.resourceFromBrowser = screenshotBuffer;
        return browserContext;
    } else {
        return {
            ...browserContext,
            resourceFromBrowser: `No active page found for browser ID: ${browserContext.id}`
        }
    }
}


const closeBrowser = async (browserId) => {
    if(browserStore.has(browserId)) {
        const browserContext = browserStore.get(browserId);
        await browserContext.browser.close();
        browserStore.delete(browserId);
        return null;
    } else {
        return `No browser found with ID ${browserId}.`;
    }
}

export const BrowserStore = {
    initializeBrowser,
    getBrowserContext,
    openNewTab,
    gotoPage,
    click,
    type,
    extract,
    cheerioScrape,
    switchTab,
    closeTab,
    screenshot,
    closeBrowser
};