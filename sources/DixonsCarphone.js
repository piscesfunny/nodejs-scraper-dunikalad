const { initPuppeteer } = require('../puppeteer');

let listingUrl = 'https://careers.dixonscarphone.com/search-and-apply?jobsearch=true&country=Ireland&county=&keyword=&contractHours=&contractType=&sector=&page=0';

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
  const { browser, page } = await initPuppeteer({
    headless:true,
    defaultViewport: null,
    slowMo: 100
  });

  let listings = []
  try {

    await new Promise(async (resolve, reject) => {
      try {

        setTimeout(() => {
          console.log('Timeout exceeded');
          resolve();
        }, 270000)

        await page.goto(pageUrl);

        let pageNumber
        while (true) {
          await page.waitForSelector('#job-search-pagination span.current');
          let dataPerPage = await page.evaluate(() => {
            let urlsPerPage = [];
            const pageNumber = document.querySelector('#job-search-pagination span.current').innerText.trim();

            let urlElements = document.querySelectorAll('#job-search-results div.row div.col-sm-4');
            let url_portion, url
            urlElements.forEach((item) => {
                url_portion = item.querySelector('a').getAttribute('href').trim();
                url = `https://careers.dixonscarphone.com${url_portion}`;

                urlsPerPage.push({
                  url: url
                });
            });

            return {url: urlsPerPage, 'pageNumber': pageNumber}
          });

          listings = listings.concat(dataPerPage.url);
          pageNumber = parseInt(dataPerPage.pageNumber);
          const nextPageLinkHandlers = await page.$x(`//span[contains(text(), 'next')]`);

          if (nextPageLinkHandlers.length > 0) {
              await page.goto(`https://careers.dixonscarphone.com/search-and-apply?jobsearch=true&country=Ireland&county=&keyword=&contractHours=&contractType=&sector=&page=${pageNumber}`, {
                timeout: 0,
                waitUntil: "networkidle0"
              })
          }
          else {
            break;
          }
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    })

    await browser.close();
    debugger

    return listings
  }
  catch(error) {
    console.log(error)
    return listings
  }
};

const scrapePage = async ({ url, $, existingData }) => {
  const title = $('.basic-job-details').prev().text().trim();

  let location = $('div.basic-job-details p').first().next().text().trim();
  location = location.replace(/ *\([^)]*\) */g, '');
  const formattedAddress = location.replace(/^[^,]+, */, '');
  let contract = $('div.basic-job-details p').first().next().next().find('strong').text().trim();
  const jobTypes = contract.replace('/', '|')

  const description = $('.job-apply').prev().html().trim()

  const company = 'Dixons Carphone'

  const data = {
    url,
    title,
    description,
    formattedAddress,
    company,
    jobTypes,
    ...existingData
  };

  return data
};


module.exports = {
  scrapePage,
  getListings,
  listingUrl,
};
