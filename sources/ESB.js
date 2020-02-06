const request = require('request-promise');
const cheerio = require('cheerio');

let listingUrl = 'https://www.candidatemanager.net/cm/p/pJobs.aspx?mid=YGTWB&sid=BUCXF&a=tXihOt3zRCE%3d%20';
let listings = [];

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);

    let urlElements = $('table > tbody > tr');
    urlElements = urlElements.slice(1);

    urlElements.map((key, item) => {
        const url = $(item).find('td').first().find('a').attr('href');

        listings.push({
            url,
        })
    });

    return listings;
};

const scrapePage = async ({ url, $, existingData }) => {
    let title = $('#ctl00_masterPageBodyContentPlaceholder_jobTitleGroup').text().trim();
    title = title.replace(/ *\([^)]*\) */g, '').trim(); // remove characters surrounded by ( )
    const jobTypes = $('#ctl00_masterPageBodyContentPlaceholder_jobTypeFieldRow > div > p').text().trim();
    const formattedAddress = $('#ctl00_masterPageBodyContentPlaceholder_jobLocationFieldRow > div > p').text().trim();
    const description = $('#ctl00_masterPageBodyContentPlaceholder_jobDetailsGroup').html().trim();

    const company = 'ESB';

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
