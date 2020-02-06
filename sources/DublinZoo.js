const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://www.dublinzoo.ie/careers/';

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);

    let listings = [];

    let urlElements = $('div.accordion-panel__content ul.vacancies-list li');
    urlElements.map((key, item) => {
        const url = $(item).find('a.button.button--no-arrow').attr('href');
        listings.push({
            url,
        })
    });

    return listings;
};

const scrapePage = async ({ url, $, existingData }) => {
    const title = $('h1.text-only-header__title').text().trim();
    const jobTypes = $('p.text-only-header__subtitle').text().trim();
    const descriptionElements = $('div.standard-content__wrapper > p');
    let description = '<div>';
    descriptionElements.map((key, item) => {
        description += $.html(item) + '\n';
    });
    description += '</div>';

    const company = 'Dublin Zoo';
    const formattedAddress= 'Dublin';

    return {
        url,
        title,
        description,
        company,
        formattedAddress,
        jobTypes,
        ...existingData,
    };
};

module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
