const { initPuppeteer } = require('../puppeteer');

const listingUrl = 'https://my.corehr.com/pls/trrecruit/erq_search_package.search_form?p_company=1&p_internal_external=E';

const getListings = async (address, searchTerm) => {

  const { browser, page } = await initPuppeteer({
    defaultViewport: null,
    // slowMo: 100
  });
  let data = []
  try {

    await new Promise(async (resolve, reject) => {
    try {
      
        setTimeout(() => {
          console.log('Timeout exceeded');
          resolve();
        }, 270000)
  
        await page.goto(listingUrl);
        await page.click('.erq_small_button');
  
        await page.waitForSelector('.erq_searchv4_count')
  
        let totalCount = await page.evaluate(() => {
          const countText = document.querySelector('.erq_searchv4_count').innerText.trim()
          const count = countText.split(' of ')[1]
          return count
        });
  
        totalCount = parseInt(totalCount)
        const countPerStep = 4
        const stepCount = Math.ceil(totalCount / countPerStep)
  
        const company = 'Trinity College'
        const formattedAddress = 'Dublin'
  
        let count = 0
        let step
  
        for (step=0; step<stepCount; step++) {
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
            } else {
              console.log(`Link not found: job title-${count} : ${title}`);
            }
  
            linkHandlers = await page.$x(`//a[contains(text(), 'Return to Search')]`);
            if (linkHandlers.length > 0) {
              await linkHandlers[0].click();
              await page.waitForSelector('.erq_searchv4_big_anchor');
            } else {
              console.log(`Back Link not found: job title-${count} : ${title}`);
            }
          }
  
          let nextPageHandlers = await page.$x(`//a[contains(text(), 'Next')]`);
          if (nextPageHandlers.length > 0) {
            await nextPageHandlers[0].click();
          } else {
            if (count < totalCount) console.log('Next Page Link Not Found');
            else {
              console.log('Finished');
              return resolve();
            } 
          }
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });

    browser.close();
    debugger

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
