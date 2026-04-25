const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  await page.goto('http://localhost:3000/auth');
  await new Promise(r => setTimeout(r, 2000));
  
  // Click the demo button
  const demoButton = await page.$('button:has-text("Entrar com Conta Demo")');
  if (demoButton) {
    await demoButton.click();
    console.log("Clicked demo button");
  } else {
    console.log("Demo button not found");
    // print page content
    const content = await page.content();
    console.log(content.substring(0, 500));
  }
  
  await new Promise(r => setTimeout(r, 5000));
  console.log("Current URL:", page.url());
  await browser.close();
})();
