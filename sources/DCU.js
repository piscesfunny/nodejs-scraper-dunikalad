const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://www.dcu.ie/hr/vacancies/current.shtml';

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    let data = [];
    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);

    const company = 'DCU';
    const formattedAddress = 'Dublin';

    const urlElements = $('div.Vacancies table tbody tr');

    urlElements.map((key, item) => {
        if (key > 0) {
            const url = 'https://www.dcu.ie' + $(item).find('td:nth-child(1) a').attr('href');
            const title = $(item).find('td:nth-child(1) a').text().trim();
            const description = $(item).find('td:nth-child(2)').html().trim() + '\n' + $(item).find('td:nth-child(3)').html().trim();

            data.push({
                url,
                title,
                description,
                formattedAddress,
                company,
            });
        }
    });

    return data;
};

const scrapePage = async ({ url, $, existingData }) => {
    return {url, ...existingData}
};


module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
