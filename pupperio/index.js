import bodyParser from 'body-parser';
import express from 'express';
import {coreBrowserFunctions} from './controllers/coreBrowserFunctions.js'
import {scriptRunner} from './controllers/scriptRunner.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json())

app.get("/status", (req, res) => {
  coreBrowserFunctions.getStatus(req,res);
});

app.get("/api/init", async (req, res) => {
  coreBrowserFunctions.initializeBrowser(req,res);
});

app.post("/api/goto", async (req, res) => {
  coreBrowserFunctions.gotoPage(req,res);
});

app.get("/api/new-tab", async (req, res) => {
  coreBrowserFunctions.openNewTab(req,res);
});

app.get("/api/screenshot", async (req, res) => {
  coreBrowserFunctions.getScreenshot(req,res);
});

app.post("/api/cheerio-scrape", async (req, res) => {
  coreBrowserFunctions.scrapeUsingCheerio(req,res);
});

app.post("/api/click",async(req,res)=>{
  coreBrowserFunctions.clickOnElement(req,res);
})

app.post("/api/type",async(req,res)=>{
  coreBrowserFunctions.typeInInput(req,res);
})

app.post("/api/switch-tab", async (req, res) => {
  coreBrowserFunctions.switchToTabIndex(req,res);
});

app.delete("/api/close-current-tab", async (req, res) => {
  coreBrowserFunctions.closeCurrentTab(req,res);
});


app.delete("/api/close-browser", async(req,res)=>{
  coreBrowserFunctions.closeBrowser(req,res);
})

app.post("/api/execute",(req,res)=>{
  if(req.body.uid == "anyDemoUID0007") scriptRunner.executeScript(req,res);
  else res.status(401).send({"msg":"YOU ARE NOT AUTHERIZED TO ACCESS THIS ENDPOINT, contact: shivkumar386112@gmail.com"})
})

app.post("/api/init-params",(req,res)=>{
  scriptRunner.initiateGlobalDefinitions(req,res);
})

app.post("/api/invoke-fun",(req,res)=>{
  scriptRunner.invokeFun(req,res);
})

app.post("/api/fetch-param",(req,res)=>{
  scriptRunner.fetchParam(req,res);
})

app.post("/api/loop",(req,res)=>{
  scriptRunner.loopExecuter(req,res);
})

app.post("/api/testing",(req,res)=>{
  console.log("REQUEST IS ", req.body);
  res.send({
    "msg":"DONE"
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});