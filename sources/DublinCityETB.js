const request = require('request-promise');
const cheerio = require('cheerio');

const listingUrl = 'http://cityofdublin.etb.ie/other/vacancies';
let listings = [];

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
  const response = await request({
    resolveWithFullResponse: true,
    uri: pageUrl,
  });
  const $ = cheerio.load(response.body);
  const urlElements = $('td.title');

  urlElements.map((key, item) => {
    const url = $(item).find('a').attr('href');
    listings.push({
      'url': url
    })
  });

  const nextPageLink = $('#pagination').find('.active').next('.page').attr('href');

  if (nextPageLink === undefined) {
    return listings
  }

  return getListings(address, searchTerm, nextPageLink);   //scraping paginated lists
};

const scrapePage = ({ url, $, existingData }) => {
  const title = $('h1.entry-title').text();

  $('div.entry-content').append('<div class="description-content"></div>');

  let pElements = $('div.entry-content').find('p');
  pElements.each(function (i, e) {
    $('div.description-content').append($(this))
  });

  const description = $('div.description-content').html().trim();

  const company = 'Dublin City ETB';
  const formattedAddress = 'Dublin';

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
