const { getListings } = require('paginated-listings-scraper');

const expectPuppeteer = require('expect-puppeteer');

expectPuppeteer.setDefaultOptions({ timeout: 10000 });

const initPuppeteer = require('../../puppeteer/initPuppeteer');
const { buildRelativeUrl } = require('../utils');

const listingsUrl = 'https://cocacola.appvault.com/av_jobSearch.html?v=cocacolacompanyrms&utm_source=JourneyCareers&utm_medium=CareerPage&utm_campaign=JobSearch';

const getListings = async () => {
  const { page, browser } = await initPuppeteer();
  await page.goto(listingsUrl);

  await page.setRequestInterception(true);

  page.on('request', (interceptedRequest) => {
    interceptedRequest.continue({
      method: 'POST',
      postData: 'txtKeywords=&selectCats=00000000-0000-0000-0000-000000000000&txtCity=&zip=&zipNoCity=&cStateZip=00000&distance=0&country=IRL&jobItem1=%220%22&jobItemsel1=JOBSTATUS&jobItem2=%5B%5D&jobItemsel2=&page=1&pageSize=25&fromPage=None&avprettyurl=true&newPage=1',
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
      },
    });
  });
  const response = await page.goto('https://useast.appvault.com/jobs/handlers/av_iSearchNew.aspx?v=cocacolacompanyrms');

  const html = await response.text();
  await browser.close();
  const listings = await getListings({
    html: /CDATA\[(.+)\]\]/s.exec(html)[1],
    maximumDepth: 100,
    parentSelector: '.job_listingDefault',
    dataSelector: {
      title: '.job_listingTitle',
      formattedAddress: '.adJobLocation',
      company: () => 'The Coca-Cola Company',
      url: ({ parent }) => buildRelativeUrl(`/${parent.find('.job_listingTitle').attr('href')}`, 'https://cocacola.appvault.com'),
    },
  });
  return listings;
};

const scrapePage = ({
  url,
  $, // see https://github.com/cheeriojs/cheerio#-selector-context-root-
  existingData,
}) => {
  const data = {
    url,
    description: $('.jobCopy').html(),
    ...existingData,
  };
  isValidItem(data);
  return data;
};


module.exports = {
  getListings,
  scrapePage,
  listingsUrl,
};
