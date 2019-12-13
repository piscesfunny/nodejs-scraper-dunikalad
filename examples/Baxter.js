const { URL } = require('url');

const { getListings } = require('paginated-listings-scraper');

const listingUrl = 'https://jobs.baxter.com/ListJobs/All/Search/language/English/Country/IE/?lang=en';

const getListings = async () => {
  const listings = await getListings({
    maximumDepth: 1,
    parentSelector: '.JobListTable tr:not(:first-child)',
    dataSelector: {
      title: ({ parent }) => parent.find('a').text().replace('Dir,', '').trim(),
      formattedAddress: ({ parent }) => parent.find('.collocation').text().split(',')[0],
      company: () => 'Baxter',
      url: ({ parent }) => {
        const { origin } = new URL(url);
        return `${origin}${parent.find('a').attr('href')}`;
      },
      jobTypes: '.coljobtype',
    },
    url: listingUrl,
  });
  return listings.filter((job) => job.title !== 'Reset');
};

const scrapePage = ({
  url,
  $, // see https://github.com/cheeriojs/cheerio#-selector-context-root-
  existingData,
}) => {
  const data = {
    url,
    description: $('.desc').html(),
    ...existingData,
  };
  return data;
};

module.exports = {
  getListings,
  scrapePage,
  listingUrl
};
