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

let globalDefinitions = {};


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

async function executeScript(req, res) {
    let train = req.body.train;
    train.sort((a, b) => a.order - b.order);

    initiateGlobalParams(req,responseWrapper);

    for (const task of train) {
        await new Promise((resolve) => {
            setTimeout(async () => {
                requestWrapper.body = task['reqBody'];
                try {
                    await getCoreFunction(task['type'])(requestWrapper, responseWrapper);
                    console.log("response after order =", task.order, " response body is ", responseWrapper.content);
                    resolve();
                } catch (e) {
                    console.log("COULD NOT PROCEED DUE TO -> ", e, "for order =", task.order);
                    resolve();
                }
            }, task['delayBeforeNextExecution']);
        });
    }

    res.send({"responses": responseWrapper.content});
}


const initiateGlobalDefinitions = (req,res)=>{
    let params = req.body.globalDefinitions;
    for(const param of params){
        try{
            if(param['type'] == 'param')globalDefinitions[[param["name"]]] = param["defaultValue"];
            else{
                console.log("Value is ", param['defaultValue'].join(''))
                globalDefinitions[[param['name']]] = eval('('+param['defaultValue'].join('')+')');
            }
        }
        catch(e){
            console.log("ERROR: while parsing global definitions-> ", e);
        }
    }
    console.log(globalDefinitions);
    res.send({"payload":globalDefinitions});
}


const scriptRunner={
    executeScript,
    initiateGlobalDefinitions
}

export {scriptRunner};