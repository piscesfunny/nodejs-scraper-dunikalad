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
      listings.push({
        'url': url,
        company: 'DHL',
      });
    }
  }
  return listings
};

const scrapePage = ({url, $, company, ...existingData}) => {
  const title = $('h1.bar-title-primary').text()
  const formattedAddress = $('span.job-location').text()
  let description = $('div.ats-description').html().trim()
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
