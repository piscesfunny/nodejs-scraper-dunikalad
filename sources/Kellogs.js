const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://kellogg.dejobs.org/irl/jobs/';
let listings = [];

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);

    let urlElements = $('#direct_listingDiv > ul:nth-child(2) > li');
    urlElements.map((key, item) => {
        const url = 'https://kellogg.dejobs.org' + $(item).find('h4 > a').attr('href');
        const title = $(item).find('h4 > a').text().trim();
        // replace tabs, newlines, multiple spaces, etc with single space
        const formattedAddress = $(item).find('div.direct_joblocation').text().trim().replace(/\s\s+/g, ' ');

        listings.push({
            url,
            title,
            formattedAddress
        })
    });

    return listings;
};

const scrapePage = async ({ url, $, existingData }) => {
    let description = $.html('#direct_listingDiv').trim();

    const company = 'Kellog’s';

    const data = {
        url,
        ...existingData,
        description,
        company,
    };

    return data;
};

module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
