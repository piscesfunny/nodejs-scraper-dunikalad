const request = require('request-promise');
const cheerio = require('cheerio');

const listingUrl = 'https://careers.dublincity.ie/vacancies.aspx';
let listings = [];

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
  const response = await request({
    resolveWithFullResponse: true,
    uri: pageUrl,
  });
  const $ = cheerio.load(response.body);
  const urlElements = $('div.JT-card div.JT-content a.JT-header');

  urlElements.map((key, item) => {
    const urlPortion = $(item).attr('href');
    const fullUrl = 'https://careers.dublincity.ie/' + urlPortion;
    listings.push({
      'url': fullUrl
    })
  });

  const nextPageLink = $('.JT-pagination').find('.JT-active').next('.JT-item').attr('href');
  if (nextPageLink)
    getListings(address, searchTerm, nextPageLink);   //scraping paginated lists
  else
    return listings

};

const scrapePage = ({ url, $, existingData }) => {
  const titleText = $('div.JT-seven').text().trim();
  const title = titleText.split('\n')[0].trim();

  $('div.JT-four').append('<div class="description-content"></div>');

  let pElements = $('div.JT-four').find('p.jobdetailsitem');
  pElements.each(function (i, e) {
    $('div.description-content').append($(this))
  });
  const description = $('div.description-content').html().trim();

  const company = 'Dublin County Council';
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
