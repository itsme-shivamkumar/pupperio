import bodyParser from 'body-parser';
import express from 'express';
import {coreBrowserFunctions} from './controllers/coreBrowserFunctions.js'

const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});