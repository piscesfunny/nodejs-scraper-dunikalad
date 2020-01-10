const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://careers.lilly.com/location/ireland-jobs/410/2963597/2';
let listings = [];

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);
    const urlElements = $('#search-results-list ul li');

    urlElements.map((key, item) => {
        const urlPortion = $(item).find('a').attr('href');
        const fullUrl = 'https://careers.lilly.com' + urlPortion;
        listings.push({
            'url': fullUrl
        })
    });

    const nextPageLinkPortion = $('#pagination-bottom .pagination-paging').find('.next').attr('href');
    const nextPageDisabled = $('#pagination-bottom .pagination-paging').find('.next.disabled').text().trim();

    if (nextPageDisabled === 'Next') {
        return listings
    }

    const nextPageLink = 'https://careers.lilly.com' + nextPageLinkPortion;

    return getListings(address, searchTerm, nextPageLink);  //scraping paginated lists
};

const scrapePage = ({ url, $, existingData }) => {
    const title = $('.job-intro__title').text().trim();
    const description = $('.ats-description').html().trim();
    const formattedAddress = $('.job-intro__location').text().trim()

    const company = 'Lily';

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
