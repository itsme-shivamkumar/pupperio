const express = require("express");
const bodyParser = require('body-parser')
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const app = express();
const port = 3000;

const link = 'https://www.programiz.com/javascript/online-compiler/';
let browser;
let pages;
let currPage;

// segregate the functions and apis
let delay = false;
let timer;

app.use(bodyParser.json())

const initializeBrowser = async()=> {
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--start-maximized'],
      defaultViewport: null
    });
    pages = await browser.pages();
    console.log("LOG: Browser launched");
    currPage = pages[0];
    console.log("LOG: curr page is set to first page")
  } catch (e) {
    console.log("error occurred: ", e);
  }
}

app.get("/status", (req, res) => {
  console.log("LOG: /status api hit");
  res.send("Server Up and Running!!!");
});

app.get("/api/init", async (req, res) => {
  initializeBrowser();
  res.send("Browser is initialized!");
});

app.post("/api/goto", async (req, res) => {
  let requestBody = req.body;
  console.log("LOG: RequestBody: ", requestBody);
  try {
    await currPage.goto(requestBody.link, { waitUntil: 'load', timeout: requestBody.timeout });
    if(requestBody.waitForSelector != "") await currPage.waitForSelector(requestBody.waitForSelector);

    res.send({"msg":"Successful", "payload":requestBody})

    // ele = await page.evaluate(getDetails, "#terminal");
  } catch (e) {
    console.log("ERROR: error occurred -> ", e);
    res.status(400);
    res.send({"msg":"BAD REQUEST", "payload":requestBody});
  }
});

app.get("/api/new-tab", async (req, res) => {
  try {
    const newPage = await browser.newPage();
    pages.push(newPage);
    currPage = newPage;
    res.send({ msg: "Opened new tab and switched to it successfully" });
  } catch (e) {
    console.log("ERROR: Unable to open new tab -> ", e);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/screenshot", async (req, res) => {
  try {
    const screenshot = await currPage.screenshot();
    res.contentType('image/png');
    res.send(screenshot);
  } catch (e) {
    console.log("ERROR: Unable to capture screenshot -> ", e);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/cheerio-scrape", async (req, res) => {
  const { selector, type } = req.body;
  
  try {
    const htmlContent = await currPage.content();
    const $ = cheerio.load(htmlContent);
    let result;

    switch (type) {
      case 'html':
        result = $(selector).html();
        break;
      case 'text':
        result = $(selector).text();
        break;
      case 'attr':
        const attributeName = req.body.attributeName;
        result = $(selector).attr(attributeName);
        break;
      case 'children':
        result = $(selector).children().toArray().map(el => $(el).html());
        break;
      case 'parent':
        result = $(selector).parent().html();
        break;
      case 'siblings':
        result = $(selector).siblings().toArray().map(el => $(el).html());
        break;
      case 'next':
        result = $(selector).next().html();
        break;
      case 'prev':
        result = $(selector).prev().html();
        break;
      default:
        res.status(400).send({ msg: 'Invalid type specified' });
        return;
    }

    res.send({ result });
  } catch (e) {
    console.log("ERROR: Unable to perform Cheerio scrape -> ", e);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/click",async(req,res)=>{
  const {selector} = req.body;
  try{
    await currPage.click(selector,{waitUntil:'load'});
    res.status(200).send({ msg: "Click successful and page loaded" });
  }
  catch(e){
    console.log("ERROR: Couldn't click on selector -> ", e);
    res.status(500).send("Internal Server Error");
  }
})

app.post("/api/type",async(req,res)=>{
  const {selector, data} = req.body;
  try{
    await currPage.type(selector,data);
    res.send({msg: `Typed "${data}" in the input element with selector "${selector}"`});
  }
  catch(e){
    console.log("ERROR: Unable to write on the selector input -> ", e);
    res.status(500).send("Internal Server Error");
  }
})

// app.post("/api/delay",(req,res)=>{
//   const {delay} = req.body;
//   if(typeof(delay)==typeof("string")) delay=parseInt(delay);
//   if(delay){
//     clearTimeout(timer);
//     timer = setTimeout(()=>{
//       delay = false;
//     },delay)
//   }
//   else{
//     delay = true;
//     timer = setTimeout(()=>{
//       delay = false;
//     },delay)
//   }
// })

app.post("/api/switch-tab", async (req, res) => {
  let { tabIndex } = req.body;
  try {
    tabIndex=parseInt(tabIndex);
    if(tabIndex+1 >pages.length){
      res.send({msg:"Tab Index Out of Range!"})
    }
    else{
      currPage = pages[tabIndex];
      res.send({ msg: "Switched to tab successfully" });
    }
  } catch (e) {
    console.log("ERROR: Unable to switch tab -> ", e);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/api/close-current-tab", async (req, res) => {
  try {
    await currPage.close();

    pages = pages.filter(page => page !== currPage);

    if(pages.length == 0){
      await browser.close();
      res.send({ msg: "Browser closed due to no active tabs available!" });
    }
    else{
      currPage = pages[pages.length - 1];
      res.send({ msg: "Current tab closed successfully" });
    }
  } catch (e) {
    console.log("ERROR: Unable to close current tab -> ", e);
    res.status(500).send("Internal Server Error");
  }
});


app.delete("/api/close-browser", async(req,res)=>{
  try{
    await browser.close();
    console.log("LOG: Browser Closed!")
    res.send({ msg: "Browser closed successfully" });
  }
  catch(e){
    console.log("ERROR: Unable to close browser -> ", e);
    res.status(500).send("Internal Server Error");
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

function getDetails(selector) {
  const detail = document.querySelectorAll(selector);
  return detail[0].innerText;
}
