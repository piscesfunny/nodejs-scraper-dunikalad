const { initPuppeteer } = require('../puppeteer');

const listingUrl = 'https://cloud.corehr.com/pls/ulliverecruit/erq_search_package.search_form?p_company=1&p_internal_external=E#';

const getListings = async (address, searchTerm) => {

  const { browser, page } = await initPuppeteer({
    headless:false,
    defaultViewport: null,
    slowMo: 100
  });
  let data = []
  try {

    await new Promise(async (resolve, reject) => {
    try {
        const company = 'University of Limerick'
        const formattedAddress = 'Limerick'

        setTimeout(() => {
          console.log('Timeout exceeded');
          resolve();
        }, 270000)
  
        await page.goto(listingUrl);
        await page.click('.erq_small_button');
  

        await page.waitForSelector('.erq_searchv4_big_anchor')

        let titles = await page.evaluate(() => {
          const linkElements = document.querySelectorAll('.erq_searchv4_big_anchor')
          let results = []
          for (let element of linkElements) {
            const result = element.innerText.trim()
            results.push(result)
          }
          return results
        });

        let count = 0
        let linkHandlers;
        for (let title of titles ) {
          count++
          linkHandlers = await page.$x(`//a[contains(text(), '${title}')]`);
          if (linkHandlers.length > 0) {
            await linkHandlers[0].click();
            await page.waitForSelector('.erq_large_button');

            const description = await page.evaluate(() => {
              const jobDetails =  document.querySelectorAll('table.erq_table_no_top_border tbody tr');
              const description = (jobDetails[0].innerHTML + jobDetails[1].innerHTML )
                .replace(/<td/g, '<p')
                .replace(/\/td/g, '/p')
                .replace(/<\/tr>|<tr>/)
              return description
            })

            console.log(`scraped job - ${count} : ${title}`)

            data.push({
              url: listingUrl,
              title,
              description,
              formattedAddress,
              company,
            })

            page.click('.erq_large_button')
            await page.waitForSelector('.erq_searchv4_big_anchor');
          } else {
            console.log(`Link not found: job title-${count} : ${title}`);
          }
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

const scrapePage = ({ url, $, existingData }) => {
  return { ...existingData, url };
}


module.exports = {
  scrapePage,
  getListings,
  listingUrl,
};
