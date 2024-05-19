import puppeteer from "puppeteer";
import cheerio from "cheerio";
import dotenv from 'dotenv';
dotenv.config();

let browser;
let pages;
let currPage;

 async function initializeBrowser(req,res){
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--single-process',
        '--no-zygote',    
    ],
      defaultViewport: null,
      executablePath: process.env.NODE_ENV === "production"
      ? process.env.PUPPETEER_EXECUTABLE_PATH
      : puppeteer.executablePath()
    });
    pages = await browser.pages();
    console.log("LOG: Browser launched");
    currPage = pages[0];
    res.send("Browser is initialized and new tab opened!");

  } catch (e) {
    console.log("error occurred: ", e);
    res.status(500);
    res.send("ERROR: INTERNAL SERVER ERROR");
  }
}

 const getStatus = async(req, res) => {
    try{
      const body = req.body;
      console.log(body);
        console.log("LOG: /status api is hit");
        res.send("Server Up and Running!!!");
    }
    catch(e){
        console.log("ERROR LOG: ",e);
        res.status(500);
        res.send("ERROR: INTERNAL SERVER ERROR");
    }
};

 const gotoPage = async (req, res) => {
  let requestBody = req.body;
    try {
      await currPage.goto(requestBody.link, { waitUntil: 'load', timeout: requestBody.timeout });
      if(requestBody.waitForSelector != "") await currPage.waitForSelector(requestBody.waitForSelector);  
      res.send({"msg":"Successful", "payload":requestBody})
      } 
      catch (e) {
      console.log("ERROR: error occurred -> ", e);
        res.status(400);
        res.send({"msg":"BAD REQUEST", "payload":requestBody});
  }
};

 const openNewTab = async (req, res) => {
  try {
    let newPage = await browser.newPage();
    pages.push(newPage);
    currPage = newPage;
    res.send({ msg: "Opened new tab and switched to it successfully" });
  } catch (e) {
    console.log("ERROR: Unable to open new tab -> ", e);
    res.status(500);
    res.send("Internal Server Error");
  }
};

 const getScreenshot = async (req, res) => {
  try {
    const screenshot = await currPage.screenshot();
    res.contentType('image/png');
    res.send(screenshot);
  } catch (e) {
    console.log("ERROR: Unable to capture screenshot -> ", e);
    res.status(500);
    res.send("Internal Server Error");
  }
};

 const scrapeUsingCheerio = async (req, res) => {
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
      case 'list':
        result = $(selector).toArray().map(el => $(el).text());
        break;
      default:
        res.status(400);
        res.send({ msg: 'Invalid type specified' });
        return;
    }

    res.send(result);
  } catch (e) {
    console.log("ERROR: Unable to perform Cheerio scrape -> ", e);
    res.status(500);
    res.send("Internal Server Error");
  }
};

 const clickOnElement = async(req,res)=>{
  const {selector} = req.body;
  try{
    if(selector.includes("globalDefinitions")){
      await currPage.click(req.params[selector.replace("globalDefinitions.","")],{waitUntil:'load'});
    }
    else await currPage.click(selector,{waitUntil: 'load'});
    res.status(200);
    res.send({ msg: "Click successful and page loaded" });
  }
  catch(e){
    console.log("ERROR: Couldn't click on selector -> ", e);
    res.status(500);
    res.send("Internal Server Error");
  }
};

 const typeInInput = async(req,res)=>{
  const {selector, data} = req.body;
  try{
    if(data.includes("globalDefinitions")){
      const globalKey = data.replace("globalDefinitions.", "");
      const globalValue = req.params[globalKey];
      await currPage.type(selector, globalValue);
    }
    else if(data.includes("keyboard.")){
      const keySequence = data.replace("keyboard.", "");
      if(keySequence=='Frontspace'){
        await currPage.focus(selector);
        await currPage.keyboard.down('Shift');
        await currPage.keyboard.press('End');
        await currPage.keyboard.up('Shift');
        await currPage.keyboard.press('Delete');
      }
      else if(keySequence == 'Backspace'){
        const inputElement = await currPage.$(`input[id="${selector.slice(1)}"]`);
        await inputElement.click();
        await currPage.focus(selector);
        await currPage.keyboard.down('Control');
        await currPage.keyboard.press('A');
        await currPage.keyboard.up('Control');
        await currPage.keyboard.press('Backspace');
      }
      else{
        await currPage.focus(selector);
        await currPage.keyboard.press(keySequence);
      }
      
    }
    else await currPage.type(selector,data);
    res.send(data);
  }
  catch(e){
    console.log("ERROR: Unable to write on the selector input -> ", e);
    res.status(500)
    res.send("Internal Server Error");
  }
};

 const switchToTabIndex = async (req, res) => {
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
    res.status(500);
    res.send("Internal Server Error");
  }
};

 const closeCurrentTab = async (req, res) => {
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
    res.status(500);
    res.send("Internal Server Error");
  }
};

 const closeBrowser = async(req,res)=>{
  try{
    await browser.close();
    console.log("LOG: Browser Closed!")
    res.send({ msg: "Browser closed successfully" });
  }
  catch(e){
    console.log("ERROR: Unable to close browser -> ", e);
    res.status(500);
    res.send("Internal Server Error");
  }
};

const coreBrowserFunctions = {
    initializeBrowser,
    getStatus,
    gotoPage,
    openNewTab,
    getScreenshot,
    scrapeUsingCheerio,
    clickOnElement,
    typeInInput,
    switchToTabIndex,
    closeCurrentTab,
    closeBrowser
}


export {coreBrowserFunctions};