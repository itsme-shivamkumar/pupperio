import Fuse from 'fuse.js';
// Action Enum
const ActionType = {
    INIT: 'INIT',
    SET_LAST_RES_AS: 'SET_LAST_RES_AS',
    NEWTAB: 'NEWTAB',
    GOTO: 'GOTO',
    CLICK: 'CLICK',
    TYPE: 'TYPE',
    CHEERIO_SCRAPE: 'CHEERIO_SCRAPE',
    EXTRACT: 'EXTRACT',
    SWITCHTAB: 'SWITCHTAB',
    CLOSETAB: 'CLOSETAB',
    CLOSE: 'CLOSE',
    SCREENSHOT: 'SCREENSHOT',
    WAITFOR: 'WAITFOR',
    UNKNOWN: 'UNKNOWN'
  };
  
const actionPatterns = [
    { key: ActionType.INIT, phrases: ['init','open browser', 'start browser', 'initialize', 'initialize browser'] },
    { key: ActionType.SET_LAST_RES_AS, phrases: ['set_last_res_as', 'set last result as', 'store last response', 'save last result'] },
    { key: ActionType.NEWTAB, phrases: ['newtab','open tab', 'open new tab', 'create tab'] },
    { key: ActionType.WAITFOR, phrases: ['waitfor', 'wait for', 'wait', 'hold'] },
    { key: ActionType.GOTO, phrases: ['goto', 'navigate', 'visit', 'open url'] },
    { key: ActionType.CLICK, phrases: ['click', 'press button', 'tap'] },
    { key: ActionType.TYPE, phrases: ['type', 'enter text', 'fill input'] },
    { key: ActionType.EXTRACT, phrases: ['extract', 'get text', 'fetch data'] },
    { key: ActionType.CHEERIO_SCRAPE, phrases: ['scrape', 'cheerio_scrape', 'scrape dom', 'query html', 'extract'] },
    { key: ActionType.SWITCHTAB, phrases: ['switchtab', 'change tab', 'focus tab'] },
    { key: ActionType.CLOSETAB, phrases: ['closetab', 'close current tab', 'close tab'] },
    { key: ActionType.CLOSE, phrases: ['close', 'shutdown browser', 'end session'] },
    { key: ActionType.SCREENSHOT, phrases: ['screenshot', 'capture page', 'take screenshot'] }
  ];
  

const flatCommands = actionPatterns.flatMap(action =>
    action.phrases.map(phrase => ({
      key: action.key,
      phrase
    }))
  );
  
const fuse = new Fuse(flatCommands, {
    keys: ['phrase'],
    threshold: 0.3 // adjust as needed
  });


const getActionTypeFromText = (text = '') => {
    const result = fuse.search(text.toLowerCase().trim());
    return result.length > 0 ? result[0].item.key : ActionType.UNKNOWN;
}

const getActionTypeFromLine = (line) => {
  return getActionTypeFromText(line.split(' ')[0]);
}

const readInstructionsFromPrompt = (text) => {
  let res = []
  text = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  text.forEach(line => {
    const actionType = getActionTypeFromLine(line);
    console.log(`Action Type: ${actionType} for line: ${line}`);
    if (actionType !== ActionType.UNKNOWN
        && actionType !== ActionType.WAITFOR
    ) {
      res.push({
        type: actionType,
        ...extractedAttributes(line, actionType)
      });
    }
    else if (actionType === ActionType.WAITFOR) {
      res[res.length - 1] = {
        ...res[res.length - 1],
        delayBeforeNextExecution: parseInt(extractedAttributes(line, actionType).attributeName) || 100
      };
    }
  });
  return res;
}

const extractedAttributes = (line, actionType) => {
  const attributes = {};
  let attr = []
  switch (actionType) {
    case ActionType.GOTO:
      line = line.replace(/goto/i, '');
      attr = line.split(' ').map(word => word.trim()).filter(word => word.length > 0);
      if (attr.length > 0) {
        attributes.selector = attr[0];
      }
      if (attr.length > 1) {
        attributes.attributeName = attr.slice(1).join(' ');
      }
      break;
    case ActionType.CLICK:
      line = line.replace(/click/i, '');
      attr = line.split(' ').map(word => word.trim()).filter(word => word.length > 0);
      if (attr.length > 0) {
        attributes.selector = attr.join(' ');
      }
      break;
    case ActionType.TYPE:
      line = line.replace(/type/i, '');
      attr = line.split(' ').map(word => word.trim()).filter(word => word.length > 0);
      if (attr.length > 0) {
        attributes.selector = attr[0];
      }
      if (attr.length > 1) {
        attributes.attributeName = attr.slice(1).join(' ');
      }
      break;
    case ActionType.EXTRACT:
      line = line.replace(/extract/i, '');
      attr = line.split(' ').map(word => word.trim()).filter(word => word.length > 0);
      if (attr.length > 0) {
        attributes.selector = attr[0];
      }
      if (attr.length > 1 && !attr[1].startsWith('attribute')) {
        attributes.attributeName = attr.slice(1).join(' ');
      }
      else if (attr.length > 1 && attr[1].startsWith('attribute')) {
        attributes.attributeName = attr[1];
        attributes.scrapeStyleAttribute = attr.slice(2).join(' ');
      }
      break;
    case ActionType.CHEERIO_SCRAPE:
      line = line.replace(/cheerio_scrape/i, '');
      attr = line.split(' ').map(word => word.trim()).filter(word => word.length > 0);
      if (attr.length > 0) {
        attributes.selector = attr[0];
      }
      if (attr.length > 1 && !attr[1].startsWith('attribute')) {
        attributes.attributeName = attr.slice(1).join(' ');
      }
      else if (attr.length > 1 && attr[1].startsWith('attribute')) {
        attributes.attributeName = attr[1];
        attributes.scrapeStyleAttribute = attr.slice(2).join(' ');
      }
      break;
    case ActionType.SWITCHTAB:
      line = line.replace(/switchtab/i, '');
      attr = line.split(' ').map(word => word.trim()).filter(word => word.length > 0);
      if (attr.length > 0) {
        attributes.attributeName = parseInt(attr.join(' '));
      }
      break;
    case ActionType.WAITFOR:
      line = line.replace(/waitfor/i, '');
      attr = line.split(' ').map(word => word.trim()).filter(word => word.length > 0);
      if (attr.length > 0) {
        attributes.attributeName = parseInt(attr.join(' '));
      }
      break;
    case ActionType.SET_LAST_RES_AS:
      line = line.replace(/set_last_res_as/i, '');
      attr = line.split(' ').map(word => word.trim()).filter(word => word.length > 0);
      if (attr.length > 0) {
        attributes.attributeName = attr.join(' ');
      }
      break;
    default:
      return attributes; // No attributes for other actions
  }
  return attributes;
}

export const actionUtil = {
    ActionType,
    readInstructionsFromPrompt
}  