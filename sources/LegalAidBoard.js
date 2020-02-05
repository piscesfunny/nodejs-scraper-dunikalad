const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://www.legalaidboard.ie/en/about-the-board/recruitment';
let listings = [];

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);

    const company = 'Legal Aid Board'

    const urlElements = $('div.content > p > strong > a');
    const url = pageUrl;

    urlElements.map((key, item) => {
        const title = $(item).text().trim();
        const description = 'https://www.legalaidboard.ie' + $(item).attr('href');
        const formattedAddress = title

        listings.push({
            url,
            title,
            description,
            formattedAddress,
            company
        })
    });

    return listings;
};

const scrapePage = ({ url, $, existingData }) => {

};

getListings()

module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
