const request = require('request-promise');
const cheerio = require('cheerio')

let listingUrl = 'http://cityofdublin.etb.ie/other/vacancies'
let listings = []

const getListings = async (address, searchTerm) => {
  const response = await request({
    resolveWithFullResponse: true,
    uri: listingUrl,
  });
  const $ = cheerio.load(response.body)
  const urlElements = $('td.title')

  urlElements.map((key, item) => {
    const url = $(item).find('a').attr('href')
    listings.push({
      'url': url
    })
  })

  listingUrl = $('#pagination').find('.active').next('.page').attr('href')
  if (listingUrl)
    getListings()   //scraping paginated lists
  else
    return listings
};

const scrapePage = ({ url, $, existingData }) => {
  const title = $('h1.entry-title').text()

  $('div.entry-content').append('<div class="description-content"></div>')

  let pElements = $('div.entry-content').find('p')
  pElements.each(function (i, e) {
    $('div.description-content').append($(this))
  })

  const description = $('div.description-content').html().trim()

  const company = 'Dublin City ETB'
  const formattedAddress = 'Dublin'

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
