
const { getPage } = require('paginated-listings-scraper');

const striptags = require('striptags');


const listingUrl = 'https://centra.ie/careers/vacancies/createMarkerScript.php?&searchSector[]=&recruitmentProcessIdIN=1&pn=1&jobTitle=&type=&postcode=&withinMiles=15&runSearch=0';

const getListings = async () => {
  const { html } = await getPage({
    url: listingUrl,
    loadCheerio: false,
  });
  return html
    .replace(/<tr><th>Job Title<\/th><th>&nbsp;<\/th><th>Location<\/th><\/tr>/g, '')
    .match(/<tr>.*?<\/tr>/gm)
    .filter(row => !row.includes('<tr> '))
    .map((row) => {
      const matchUrl = row.match(/href="([^"]+)/g);
      if (matchUrl) {
        const url = row.match(/href="([^"]+)/g)[0].replace('href="', '').trim();
        const title = row.match(/<a.+>(.*?)<\/a>/)[1];
        const formattedAddress = striptags(row.replace(title, '')).replace(/Centra ,|Centra/, '');
        return {
          url,
          company: 'Centra',
          formattedAddress,
          title,
        };
      }
    })
    .filter(Boolean);
};

const scrapePage = ({
  url,
  $, // see https://github.com/cheeriojs/cheerio#-selector-context-root-
  existingData,
}) => {
  const data = {
    url,
    description: $('.viewDataFD').first().html(),
    ...existingData,
  };
  isValidItem(data);
  return data;
};

module.exports = {
  getListings,
  scrapePage,
  listingUrl,
};
