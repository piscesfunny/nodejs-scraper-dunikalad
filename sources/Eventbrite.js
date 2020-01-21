const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://www.eventbritecareers.com/jobs/search?page=1&country_codes%5B%5D=IE&query=';


const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    let listings = [];

    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);
    const urlElements = $('td.job-search-results-title');

    urlElements.map((key, item) => {
        const fullUrl = $(item).find('a').attr('href').trim();
        listings.push({
            'url': fullUrl
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

    const title = $('#block_image_text_0_0 h1').text().trim();
    const formattedAddress = $('#block_image_text_0_0 h2').text().trim();
    const jobTypeText = $('#job_sub_header_2_0').text().trim();
    const jobTypes = jobTypeText.split(' | ')[0]

    let descriptionElement = $('.job-description').children().first();
    let description = $.html(descriptionElement).trim() + '\n';

    let flag;
    let anchorElementWrapper
    while (true){
        descriptionElement = descriptionElement.next();
        flag = descriptionElement.text().trim()
        if (flag === 'ABOUT EVENTBRITE')
            break;
        anchorElementWrapper = descriptionElement.find('a').attr('href')
        if (anchorElementWrapper)
            continue
        description += $.html(descriptionElement).trim() + '\n';
    }

    const company = 'Eventbrite';

    const data = {
        url,
        title,
        description,
        formattedAddress,
        company,
        jobTypes,
        ...existingData
    };
    return data;
};


module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
