const { initPuppeteer } = require('../puppeteer');

let listingUrl = 'https://libertyglobal.wd3.myworkdayjobs.com/en-US/VMIE_Careers';

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
  const { browser, page } = await initPuppeteer({
    defaultViewport: null,
    slowMo: 100
  });

  let data = []

  try {
    await new Promise(async (resolve, reject) => {
      try {
        await page.goto(pageUrl, {
          timeout: 0,
          waitUntil: "networkidle0"
        });

        const elements = await page.$$('#wd-FacetedSearchResult-ResultsPnl-facetSearchResult > div > div > div.WHGO > ul > li div.WM3O > div');
        let title, description, formattedAddress
        for (let x=0; x<elements.length; x++) {
          const elements = await page.$$('#wd-FacetedSearchResult-ResultsPnl-facetSearchResult > div > div > div.WHGO > ul > li div.WM3O > div');
          await elements[x].click();
          await page.waitForSelector('.GWTCKEditor-Disabled');

          const jobData = await page.evaluate(() => {
            title = document.querySelector('.GWTCKEditor-Disabled > h1').innerText.trim()
            description =  document.querySelectorAll('.GWTCKEditor-Disabled')[1].innerHTML.trim()
            formattedAddress = document.querySelectorAll('div#wd-PageContent-vbox > div.WCRO > ul.WMPO')[1].innerText.trim()
                  .split('\n\n\n')
                  .join(' | ')

            return {
              title,
              description,
              formattedAddress
            }
          })

          const company = 'Virgin Media'

          data.push({
            url: page.url(),
            ...jobData,
            company
          })
          console.log(`scraped job : ${jobData.title}`)

          await page.goto(pageUrl, {
            timeout: 0,
            waitUntil: "networkidle0"
          });
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });

    browser.close();

    return data

  } catch(error) {
    console.log(error)
    return data
  }
};

const scrapePage = async ({ url, $, existingData }) => {

};

module.exports = {
  scrapePage,
  getListings,
  listingUrl,
};
