const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://www.citizensinformationboard.ie/en/news/vacancies.html';


const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    let listings = [];

    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);
    const urlElements = $('ul.newslist li');

    let urlPortion, fullUrl, title;
    urlElements.map((key, item) => {
        title = $(item).find('a').text().trim()
        urlPortion = $(item).find('a').attr('href');
        if (urlPortion) {
            urlPortion = urlPortion.trim();
            if (urlPortion.indexOf('http') === -1)
                fullUrl = `https://www.citizensinformationboard.ie${urlPortion}`;
            else
                fullUrl = urlPortion

            listings.push({
                'url': fullUrl,
                'title': title
            })
        }

    });

    return listings;
};

const scrapePage = async ({ url, $, existingData }) => {
    let description = $('div.content').html().trim();

    const company = 'CitizensInformation';
    const formattedAddress = 'Ireland  ';

    const data = {
        url,
        description,
        formattedAddress,
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
