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

const scrapePage = ({url, $, ...existingData}) => {
  const title = $('h1.bar-title-primary').text()
  let description = ''
  const jobDetails = $('div.earcu_posdescriptionnote p')
  for (let i=0; i<jobDetails.length; i++){
    description += $(jobDetails[i]).text()
    description += '\n'
  }
  const data = {
    url,
    title,
    description,
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
