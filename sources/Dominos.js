const puppeteer = require('puppeteer');

const listingUrl = 'https://isw.changeworknow.co.uk/dominos/vms/e/stores/search/edit'

const getListings = async (address, searchTerm) => {
  const browser = await puppeteer.launch({
    // headless: false,
    slowMo: 200
  });
  const page = await browser.newPage();
  await page.goto(listingUrl)

  await page.type('input#search_origin_address', 'ireland')

  await page.focus( 'input#search_range' )
  await page.keyboard.down( 'Control' )
  await page.keyboard.press( 'A' )
  await page.keyboard.up( 'Control' )
  await page.keyboard.press( 'Backspace' )
  await page.type('input#search_range', '200')

  await page.keyboard.press('Enter')
  await page.waitForNavigation({waitUntil: 'load'})

  let listings = []
  let loopNext = true

  while (loopNext) {
    let newUrls = await page.evaluate(() => {
      let urlsPerPage = [];
      let items = document.querySelectorAll('div.position_opening');
      items.forEach((item) => {
        const url_portion = item.querySelector('h1.panel-title a').getAttribute('href')
        const url = "https://isw.changeworknow.co.uk" + url_portion
        urlsPerPage.push({
          url: url
        });
      });

      let loopNext = true
      const linkElem = document.querySelector('a[rel="next"]')
      if (linkElem == null) loopNext = false

      return { url: urlsPerPage, 'loopNext': loopNext}
    });

    listings = listings.concat(newUrls.url);
    loopNext = newUrls.loopNext
    if (loopNext) {
      await Promise.all([
        await page.click('a[rel="next"]'),
        await page.waitForSelector('div.position_opening')
      ])
    }
  }

  await browser.close();

  return listings
}

const scrapePage = ({url, $, existingData }) => {
  const metaElement = $('div.panel-body').first()
  const title = metaElement.find('h4').text().trim()

  let formattedAddressText = metaElement.find('p').first().text().trim()
  let tempList = formattedAddressText.split(':')
  let listLength = tempList.length - 1
  const formattedAddress = tempList[listLength].trim()

  const company = 'Domino';
  
  const description = $('div.panel-body').last().html().trim()

  const data = {
    url,
    title,
    formattedAddress,
    description,
    company,
    ...existingData
  };
  return data;
};

module.exports = {
  scrapePage,
  getListings,
  listingUrl,
};
