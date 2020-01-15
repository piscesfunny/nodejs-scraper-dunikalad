const { initPuppeteer } = require('../puppeteer');

const listingUrl = 'https://ups.taleo.net/careersection/10041/jobsearch.ftl?lang=en&portal=2240090492';
let data = []

const getListings = async (address, searchTerm) => {
  const { browser, page } = await initPuppeteer({
    defaultViewport: null,
    slowMo: 100
  });

  await page.goto(listingUrl, {
    timeout: 0,
    waitUntil: "networkidle0"
  });

  await page.waitForSelector('.titlelink')

  const company = 'UPS'
  const url = 'https://ups.taleo.net/careersection/10041/jobdetail.ftl'


  let count
  let linkHandlers

  while (true) {
    count = 0
    let titles = await page.evaluate(() => {
      const linkElements = document.querySelectorAll('.titlelink a')
      let results = []
      for (let element of linkElements) {
        const result = element.innerText.trim()
        results.push(result)
      }
      return results
    });

    let formattedAddresses = await page.evaluate(() => {
      const addressElements = document.querySelectorAll('.morelocation .text')
      let results = []
      let tempAddress
      for (let element of addressElements) {
        tempAddress = element.innerText.trim()
        tempAddress = tempAddress.replace(/(\b\S.+\b)(?=.*\1)/g, "").trim();
        tempAddress = tempAddress.replace(/IE-/g, "").trim();
        tempAddress = tempAddress.replace(/-/g, ", ").trim();
        results.push(tempAddress)
      }
      return results
    });


    let formattedAddress
    for (let title of titles ) {
      formattedAddress = formattedAddresses[count]
      count++

      linkHandlers = await page.$x(`//a[contains(text(), '${title}')]`);
      if (linkHandlers.length > 0) {
        await linkHandlers[0].click();
        await page.waitForSelector('.mastercontentpanel3');

        const description = await page.evaluate(() => {
          const description =  document.querySelector('.mastercontentpanel3').innerHTML.trim();
          return description
        })

        data.push({
          url,
          title,
          description,
          formattedAddress,
          company,
        })

        console.log(`job - ${count} : ${title}`)
      } else {
        console.log("Link not found");
      }

      linkHandlers = await page.$x(`//a[contains(text(), 'Back to prior page')]`);
      if (linkHandlers.length > 0) {
        await linkHandlers[0].click();
        await page.waitForSelector('.titlelink');
      } else {
        console.log("Back Link not found");
      }
    }

    let nextPageDisabled = await page.evaluate(() => {
      const result = document.querySelector('a[title="Go to the next page"]').getAttribute('aria-disabled')
      return result
    })

    if (nextPageDisabled === 'false'){
      let nextPageHandlers = await page.$x(`//a[contains(text(), 'Next')]`);
      if (nextPageHandlers.length > 0) {
        await nextPageHandlers[0].click();
        await timeout(3000)
      } else {
        console.log('Next Page Link Not Found');
      }
    }
    else {
      console.log('Finished')
      break
    }
  }

  browser.close()

  return data
};

const scrapePage = async ({ existingData }) => {

};

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))

module.exports = {
  scrapePage,
  getListings,
  listingUrl,
};
