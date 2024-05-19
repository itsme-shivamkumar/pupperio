import { coreBrowserFunctions } from "./coreBrowserFunctions.js";

class RequestWrapper {
    constructor() {
        this.params = {};
        this.body = {};
    }
}
  
class ResponseWrapper {
    constructor() {
        this.content = [];
        this.responseStatus = 200;
        this.type = 'json';
    }

    contentType(obj) {
        this.type = obj;
    }

    send(obj) {
        this.content.push(obj);
    }

    status(obj) {
        this.responseStatus = obj;
    }
}

let globalDefinitions = {
    "prev":null,
};

const createRequestWrapper = () => new RequestWrapper();
const createResponseWrapper = () => new ResponseWrapper();


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
        case 'invoke-fun':
            return invokeFun;
        case 'init-params':
            return initiateGlobalDefinitions;
        case 'fetch-param':
            return fetchParam;
        case 'loop':
            return loopExecuter;
        case 'execute-script':
            return executeScript;
        default:
            return function(req,res){
                res.send("NO VALID CORE BROWSER FUNCTION AVAILABLE");
            }
    }
}

const initiateGlobalDefinitions = (req,res)=>{
    let params = req.body.globalDefinitions;
    for(const param of params){
        try{
            if(param['type'] == 'param')globalDefinitions[[param["name"]]] = param["defaultValue"];
            else if(param['type'] == 'save-script') globalDefinitions[[param["name"]]] = param["defaultValue"];
            else{
                globalDefinitions[[param['name']]] = eval('('+param['defaultValue'].join('')+')');
                console.log(`Saved function for ${param['name']} as ${JSON.stringify(globalDefinitions[param['name']])}`);
            }
        }
        catch(e){
            console.log("ERROR: while parsing global definitions-> ", e);
        }
    }
    res.send({"globalDefinitionsSetSuccessfully":globalDefinitions});
}

async function executeScript(req, res) {
    const requestWrapper = createRequestWrapper();
    const responseWrapper = createResponseWrapper();
    let train = req.body.train;
    train.sort((a, b) => a.order - b.order);

    if(req.body.hasOwnProperty("globalDefinitions"))
        initiateGlobalDefinitions(req,responseWrapper);

    for (const task of train) {
        await new Promise((resolve) => {
            setTimeout(async () => {
                requestWrapper.body = task['reqBody'];
                if(task['type'] == 'type' || task['type'] == 'click')requestWrapper.params = globalDefinitions;
                if(task['type'] == 'execute-script')requestWrapper.body = globalDefinitions[requestWrapper.body.name];
                try {
                    await getCoreFunction(task['type'])(requestWrapper, responseWrapper);
                    globalDefinitions.prev = responseWrapper.content[responseWrapper.content.length -1];
                    // console.log(`After order = ${task.order}, globalDefs = ${globalDefinitions}, response = ${JSON.stringify(responseWrapper)}`);
                    // console.log("-------------------------------------------------")
                    // console.log("-------------------------------------------------")
                    resolve();
                } catch (e) {
                    console.log("REQUEST IS -> ", req.body);
                    console.log("COULD NOT PROCEED DUE TO -> ", e, "for order =", task.order);
                    resolve();
                }
            }, task['delayBeforeNextExecution']);
        });
    }
    await res.send({"responses": responseWrapper.content});
}

const invokeFun = (req, res) => {
    if(globalDefinitions.hasOwnProperty(req.body.name)){
        let funName = req.body.name;
        let params = req.body.params;
        params.map((item)=>{
            if(globalDefinitions.hasOwnProperty(item)) return globalDefinitions.item;
            else return item;
        });
        globalDefinitions.prev = globalDefinitions[funName].call(null,...params);
        res.status(200);
        res.send({"msg":`Function: ${funName} is successfully executed with params ${params.join(' ')} and has returned ${globalDefinitions.prev}`})
    }
    else{
        res.status(404);
        res.send({"msg":`NO FUNCTION IS FOUND WITH THIS NAME -> ${req.body.name}`, "code":"NOT FOUND: 404"})
    }
}

const fetchParam = async(req, res) => {
    const requestWrapper = createRequestWrapper();
    const responseWrapper = createResponseWrapper();
    requestWrapper.body = req.body;
    if(globalDefinitions.hasOwnProperty(requestWrapper.body.name)){
        await executeScript(requestWrapper,responseWrapper);
        res.send({"fetchParamSucceeded->": responseWrapper});
    }
    else{
        res.status(404);
        res.send({"msg":"NO PARAM IS FOUND WITH THIS NAME", "code":"NOT FOUND: 404"})
    }
}

const loopExecuter = async (req,res) =>{
    const requestWrapper = createRequestWrapper();
    const responseWrapper = createResponseWrapper();
    if(req.body.stoppingCondition 
        && globalDefinitions.hasOwnProperty(req.body.stoppingCondition)){
            let stoppingCondition = globalDefinitions[req.body.stoppingCondition];
            //TODO-> bug: fix for not executing it for stoppingCondition[type] = param
            const requestWrapper = createRequestWrapper();
            const responseWrapper = createResponseWrapper();
            while(!stoppingCondition()){
                requestWrapper.body = req.body;
                try{
                    await executeScript(requestWrapper,responseWrapper);
                }
                catch(e){
                    console.log("CANT RUN -> ",e);
                }
            }
            res.send({"loop-execution succeeded": responseWrapper});
    }
    else{
        res.send({"msg":"Cannot execute loop"});
    }
}


const scriptRunner={
    executeScript,
    initiateGlobalDefinitions,
    invokeFun,
    fetchParam,
    loopExecuter
}

export {scriptRunner};