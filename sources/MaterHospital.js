const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://www.mater.ie/healthcare-professionals/job-opportunities';

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: listingUrl,
    });
    const $ = cheerio.load(response.body);

    const jobContentElements = $('div.panel-group');

    const url = listingUrl
    let title = '';
    let description = '';
    let formattedAddress = 'Dublin';
    let company = 'Mater Hospital';
    let jobTitleDescriptionElements = null;
    let data = [];

    jobContentElements.map((key, item) => {
        jobTitleDescriptionElements = $(item).find('.panel-default');

        jobTitleDescriptionElements.map((key, item) => {
            title = $(item).find('.panel-heading a .panel-title').text().trim()
            description = $(item).find('.panel-collapse .panel-body .picture-component').html().trim()
            data.push({
                url,
                title,
                description,
                formattedAddress,
                company,
            })
        });
    });

    return data;
};

const scrapePage = async ({ url, $, existingData }) => {
    return {
        url,
        ...existingData
    }
};

module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
