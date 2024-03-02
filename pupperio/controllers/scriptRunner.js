import { coreBrowserFunctions } from "./coreBrowserFunctions.js";

let requestWrapper = {
    body:{}
};
let responseWrapper = {
    content:{},
    send: function(obj){
        this.content = obj;
    }
};

 async function execute(req,res){
    requestWrapper.body = req.body;
    coreBrowserFunctions.getStatus(requestWrapper,responseWrapper);
    console.log(responseWrapper.content);
    res.send(responseWrapper.content);
}

const scriptRunner={
    execute,
}

export {scriptRunner};