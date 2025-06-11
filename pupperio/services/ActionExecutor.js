import {actionUtil} from '../utils/actionUtil.js';
import {BrowserStore} from './BrowserStore.js';
import { MiddleWareFilter } from './MiddleWareFilter.js';

const paramStore = new Map();

const executeAction = async (browserContext, action) => {
    /**
     * action: {
     *    type: 'INIT' | 'NEWTAB' | 'GOTO' | 'CLICK' | 'TYPE' | 'EXTRACT' | 'CHEERIO_SCRAPE' | 'SWITCHTAB' | 'CLOSETAB' | 'CLOSE' | 'SCREENSHOT' | 'CLOSE,
     *    selector: string, // for GOTO, CLICK, TYPE, EXTRACT, CHEERIO_SCRAPE, SWITCHTAB actions
     *    attributeName: string, // for GOTO, CHEERIO_SCRAPE, TYPE, SWITCHTAB action
     *    scrapeStyleAttribute: string // for CHEERIO_SCRAPE like 'fontSize', 'color', 'backgroundColor', etc.
     *  }
     */
    switch (action.type) {
        case actionUtil.ActionType.SET_LAST_RES_AS:
            paramStore.set(action.attributeName, browserContext.resourceFromBrowser)
            return browserContext;
        case actionUtil.ActionType.INIT:
            return await BrowserStore.initializeBrowser((browserContext != null && browserContext.id != null) 
            ? browserContext.id : null);
        case actionUtil.ActionType.NEWTAB:
            return await BrowserStore.openNewTab(browserContext);
        case actionUtil.ActionType.GOTO:
            return await BrowserStore.gotoPage(browserContext, action.selector, action.attributeName);
        case actionUtil.ActionType.CLICK:
            return await BrowserStore.click(browserContext, action.selector);
        case actionUtil.ActionType.TYPE:
            return await BrowserStore.type(browserContext, action.selector, action.attributeName);
        case actionUtil.ActionType.CHEERIO_SCRAPE:
            return await MiddleWareFilter.filter(await BrowserStore.cheerioScrape(browserContext, action.selector, 
                action.attributeName, action.scrapeStyleAttribute), action);
        case actionUtil.ActionType.SWITCHTAB:
            return await BrowserStore.switchTab(browserContext, action.attributeName);
        case actionUtil.ActionType.CLOSETAB:
            return await BrowserStore.closeTab(browserContext);
        case actionUtil.ActionType.CLOSE:
            return await BrowserStore.closeBrowser(browserContext.id);
        case actionUtil.ActionType.SCREENSHOT:
            return await BrowserStore.screenshot(browserContext);
        case actionUtil.ActionType.EXTRACT:
            return await BrowserStore.extract(browserContext, action.selector, action.attributeName);
        default:
            return {
                ...browserContext,
                resourceFromBrowser: `Unknown action type: ${action.type}`
            };
    }
}

export const ActionExecutor = {
    executeAction
};