const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://www.griffith.ie/work-at-griffith';

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: listingUrl,
    });
    const $ = cheerio.load(response.body);

    const jobContentElements = $('div.paragraphs-item-content-accordion div.paragraph-content');

    const url = listingUrl
    let title = '';
    let description = '';
    let formattedAddress = '';
    let company = 'Griffith College';
    let jobTitleDescriptionElements = null;
    let data = [];

    jobContentElements.map((key, item) => {
        jobTitleDescriptionElements = $(item).find('.accordion-items .paragraphs-items .paragraphs-item-content-accordion-item');

        formattedAddress = $(item).find('h3').text().trim()

        jobTitleDescriptionElements.map((key, item) => {
            title = $(item).find('.accordion-item-title').text().trim()
            description = $(item).find('.accordion-item-body').html().trim()

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

};


module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
