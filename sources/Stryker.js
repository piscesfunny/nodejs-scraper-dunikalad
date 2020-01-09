const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://careers.stryker.com/search?keywords=ireland';
let listings = [];

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);
    const urlElements = $('#job-result-table tbody tr.job-result');

    urlElements.map((key, item) => {
        const urlPortion = $(item).find('td.job-result-title-cell a').attr('href');
        const fullUrl = 'https://careers.stryker.com' + urlPortion;
        listings.push({
            'url': fullUrl
        })
    });

    const nextPageLinkPortion = $('#jrp-pagination-section .pagination .active').next('.jrp-pagination-number').find('a').attr('href');
    if (nextPageLinkPortion === undefined) {
        return listings
    }

    const nextPageLink = 'https://careers.stryker.com' + nextPageLinkPortion;

    return getListings(address, searchTerm, nextPageLink);  //scraping paginated lists
};

const scrapePage = ({ url, $, existingData }) => {
    const title = $('#jdp-title-job-title span.jdp-title-job-title').text().trim();
    const description = $('#jdp-job-description-section div.jdp-job-description-card').html().trim();
    const jobLocation = $('span.jobLocation').text().trim()
    const formattedAddress = `${jobLocation}, County ${jobLocation}, Ireland`

    const company = 'Stryker';

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

// const main = async () => {
//     const result = await getListings({}, '')
//     const temp = result
// }
// main()

module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
