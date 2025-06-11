import { actionUtil } from "../utils/actionUtil.js";
import { ActionExecutor } from "./ActionExecutor.js";

const paramStore = new Map();

const run = async (browserContext, train) => {
    for (const task of train) {
        browserContext = await new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    await ActionExecutor.executeAction(browserContext, task);
                    resolve();
                } catch (e) {
                    resolve();
                }
            }, (isNullOrEmpty(task['delayBeforeNextExecution']))
                ? 100
                : task['delayBeforeNextExecution']);});
    }
    return browserContext;
}


function isNullOrEmpty(value) {
    return value === null || value === undefined || value === ''
    || value === 'null' || value === 'undefined' || value === 'NaN'
    || (typeof value === 'string' && value.trim() === '');
}

export const RunScript = {
    run
};