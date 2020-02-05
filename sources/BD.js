const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://www.bdcareers.ie/jobs';
let listings = [];

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);

    let urlElements = $('h2.entry-title.fusion-post-title');

    let url, title, location, tempList, formattedAddress

    urlElements.map((key, item) => {
        url = $(item).find('a').attr('href');
        title = $(item).find('a').text().trim()
        location = $(item).next().next().text().trim()
        tempList = location.split(' ')
        formattedAddress = tempList[tempList.length-1].trim()

        listings.push({
            url,
            title,
            formattedAddress
        })
    });

    return listings;
};

const scrapePage = async ({ url, existingData }) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: url,
    });
    const $ = cheerio.load(response.body);

    const detailElem = $('.GWTCKEditor-Disabled');

    const description = $('.GWTCKEditor-Disabled').first().next().html().trim();

    const company = 'BD'

    const data = {
        url,
        ...existingData,
        description,
        company
    };

    return data;
};

// getListings()
scrapePage({url: 'https://bdx.wd1.myworkdayjobs.com/EXTERNAL_CAREER_SITE_IRELAND/job/IRL-Limerick---Castletroy/Product-Specialist---Infusion-Systems_R-351431-7'})

module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
