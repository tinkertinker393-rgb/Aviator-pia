import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  let platform = req.body.platform || (req.body && req.body.platform);

  const platformConfig = {
    betika: {
      url: 'https://www.betika.com/en-ke/aviator',
      selectors: [
        '.aviator-current-multiplier',
        '.current-multiplier-value',
        '.aviator-bar .multiplier',
        '.multiplier'
      ]
    },
    odi: {
      url: 'https://www.odibets.com/games/aviator',
      selectors: [
        '.aviator-current-multiplier',
        '.multiplier',
        '.current-multiplier-value'
      ]
    },
    shabiki: {
      url: 'https://www.shabiki.com/games/aviator',
      selectors: [
        '.aviator-current-multiplier',
        '.multiplier',
        '.crash-value'
      ]
    },
    sportpesa: {
      url: 'https://www.sportpesa.com/games/aviator',
      selectors: [
        '.aviator-current-multiplier',
        '.multiplier',
        '.multiplier-value'
      ]
    }
  };

  const config = platformConfig[platform];

  if (!config) {
    res.status(400).json({ success: false, error: "Unknown platform" });
    return;
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 30000 });

    let value = null;
    for (const selector of config.selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        value = await page.$eval(selector, el => el.textContent.trim());
        if (value) break;
      } catch (e) {}
    }

    await browser.close();

    if (value) {
      res.status(200).json({ success: true, value });
    } else {
      res.status(404).json({ success: false, error: "No crash/multiplier value found" });
    }
  } catch (err) {
    if (browser) await browser.close();
    res.status(500).json({ success: false, error: "Scraping failed: " + err.message });
  }
}
