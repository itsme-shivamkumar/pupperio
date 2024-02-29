const express = require("express");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const link = 'https://www.programiz.com/javascript/online-compiler/';
let browser;
let page;
let ele;

(async function () {
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--start-maximized'],
      defaultViewport: null
    });
    const pages = await browser.pages();
    page = pages[0];
    console.log("Browser launched");
  } catch (e) {
    console.log("error occurred: ", e);
  }
})();

const app = express();
const port = 3000;

app.get("/api/demo", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/init", async (req, res) => {
  console.log("page is ", page);
  res.send(page);
});

app.get("/api/launch", async (req, res) => {
  try {
    await page.goto(link, { waitUntil: 'load', timeout: 60000 });
    await page.waitForSelector(".desktop-run-button");
    await page.click(".desktop-run-button");
    await page.waitForSelector(".ace_text-input");
    ele = await page.evaluate(getDetails, "#terminal");
    res.send(ele);
    console.log(ele);
  } catch (e) {
    console.log("error occurred: ", e);
    res.status(400);
    res.send("BAD REQUEST");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

function getDetails(selector) {
  const detail = document.querySelectorAll(selector);
  return detail[0].innerText;
}
