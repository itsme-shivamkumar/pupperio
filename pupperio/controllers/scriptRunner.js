import { coreBrowserFunctions } from "./coreBrowserFunctions.js";

let requestWrapper = {
    params:{},
    body:{}
};

let responseWrapper = {
    content:[],
    responseStatus:200,
    type:'json',
    contentType:function(obj){
        this.type = obj;
    },
    send: function(obj){
        this.content.push(obj);
    },
    status: function(obj){
        this.responseStatus = obj;
    }
};

const getCoreFunction = (cmd)=>{
    switch(cmd){
        case 'status':
            return  coreBrowserFunctions.getStatus;
        case 'init':
            return coreBrowserFunctions.initializeBrowser;
        case 'goto':
            return coreBrowserFunctions.gotoPage;
        case 'screenshot':
            return coreBrowserFunctions.getScreenshot;
        case 'new-tab':
            return coreBrowserFunctions.openNewTab;
        case 'switch-tab':
            return coreBrowserFunctions.switchToTabIndex;
        case 'click':
            return coreBrowserFunctions.clickOnElement;
        case 'type':
            return coreBrowserFunctions.typeInInput;
        case 'cheerio-scrape':
            return coreBrowserFunctions.scrapeUsingCheerio;
        case 'close-current-tab':
            return coreBrowserFunctions.closeCurrentTab;
        case 'close-browser':
            return coreBrowserFunctions.closeBrowser;
        default:
            return function(req,res){
                res.send("NO VALID CORE BROWSER FUNCTION AVAILABLE");
            }
    }
}

 async function executeScript(req,res){
    let train = req.body.train;
    train.sort((a,b)=>a.order - b.order);
    for(let i =0;i<train.length;i++){
        let task = train[i];
        await new Promise((resolve) => {
            setTimeout(() => {
                requestWrapper.body = task['reqBody'];
                try {
                    getCoreFunction(task['type'])(requestWrapper, responseWrapper)
                    console.log("response after order = ", i, " response body is ", responseWrapper.content);
                    resolve();
                } catch (e) {
                    console.log("COULD NOT PROCEED DUE TO -> ", e, "for index = ", i);
                    resolve();
                }
            }, task['delayBeforeNextExecution']);
        });
    }
    res.send({"responses":responseWrapper.content});
}

const scriptRunner={
    executeScript,
}

export {scriptRunner};