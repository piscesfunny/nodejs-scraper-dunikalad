// interface Address {
//   county: String,
//   formatted: String
// }

const listingUrl = 'https://test.com/test-listing';

const getListings = (
  formattedAddress, // Address
  searchTerm,
) => {
  // scrape data from the listingUrl
  return [{
    url: 'url',
  }];
};

const scrapePage = ({
  url,
  $, // see https://github.com/cheeriojs/cheerio#-selector-context-root-
  existingData,
}) => {
  const data = {
    url,
    description: 'description',
    ...existingData,
  };
  return data;
};

const scrapePageRequestOptions = {};

module.exports = {
  scrapePage,
  getListings,
  scrapePageRequestOptions,
  listingUrl,
};
