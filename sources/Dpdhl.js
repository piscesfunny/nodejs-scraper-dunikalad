const request = require('request-promise');
const cheerio = require('cheerio')

const listingUrl = 'https://www.dpdhl.jobs/search-jobs/Ireland/1886/2/2963597/53/-8/50/2'

const getListings = async (address, searchTerm) => {
  const { body: html } = await request({
    resolveWithFullResponse: true,
    uri: listingUrl,
  });
  const $ = cheerio.load(html)
  const urlElems = $('li.job-entry')
  listings = []
  for (let i=0; i<urlElems.length; i++) {
    const urlA = $(urlElems[i]).find('a')
    if (urlA) {
      const url_portion = $(urlA).attr('href')
      const url = "https://www.dpdhl.jobs" + url_portion
      listings.push({'url': url});
    }
  }
  return listings
};

const scrapePage = ({url, $, company, ...existingData}) => {
  const title = $('h1.bar-title-primary').text()
  const address = $('span.job-location').text()
  let description = $('div.ats-description').html().trim()
  const data = {
    url,
    title,
    address,
    description,
    company,
    ...existingData
  };
  return data;
};

const scrapePageRequestOptions = {}

module.exports = {
  scrapePage,
  getListings,
  scrapePageRequestOptions,
  listingUrl,
};
