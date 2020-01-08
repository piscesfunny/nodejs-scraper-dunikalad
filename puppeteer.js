const chromium = require('chrome-aws-lambda');

const {
  NODE_ENV,
  HEADLESS,
} = process.env;

const isDevelopment = NODE_ENV !== 'production';

const getSettings = async (launchSettings) => (isDevelopment ? {
  headless: !!HEADLESS,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ...launchSettings,
} : {
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath,
  headless: chromium.headless,
});

const initPuppeteer = (launchSettings) => new Promise(async (res, rej) => {
  try {
    setTimeout(() => {
      rej(new Error('Puppeteer took too long'));
    }, 10000);

    const settings = await getSettings(launchSettings);

    const browser = await chromium.puppeteer.launch(settings);

    const page = await browser.newPage();

    res({ browser, page });
  } catch (err) {
    rej(err);
  }
});

const clearTextInputAndType = async (input, text) => {
  await input.click({ clickCount: 3 });
  await input.type(text);
};

module.exports = {
  initPuppeteer,
  clearTextInputAndType
};