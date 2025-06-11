import { actionUtil } from "../utils/actionUtil.js";
import { BrowserStore } from "./BrowserStore.js"

const filter = async (browserContext, action) => {
    if (action.type === actionUtil.ActionType.CHEERIO_SCRAPE 
        && isResponseNullOrEmpty(browserContext.resourceFromBrowser)) {
            return await BrowserStore.extract(browserContext, action.selector,
                action.attributeName, action.scrapeStyleAttribute);
    }
    return browserContext;
}

function isResponseNullOrEmpty(resourceFromBrowser) {
    return resourceFromBrowser === null || 
    resourceFromBrowser === undefined ||
    resourceFromBrowser === '' ||
    resourceFromBrowser === 'undefined' ||
    resourceFromBrowser === 'null' ||
    resourceFromBrowser.includes(ERROR_SCRAPE_TYPE);
}


export const MiddleWareFilter = {
    filter
};