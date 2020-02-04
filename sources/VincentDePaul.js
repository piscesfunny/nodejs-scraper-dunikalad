const request = require('request-promise');
const cheerio = require('cheerio');
const { last } = require('lodash')
let listingUrl = 'https://www.svp.ie/jobs/vacancies-listing.aspx';
let listings = [];
let count = 0

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);
    const urlElements = $('div.pagebox ul.newslist li.clearfix');

    let urlPortion, fullUrl;
    urlElements.map((key, item) => {
        urlPortion = $(item).find('a').attr('href');
        if (urlPortion) {
            const [urlPath, params] = last(urlPortion.split('/')).split('?');
            fullUrl = `https://www.svp.ie/jobs/vacancies-listing/${encodeURIComponent(urlPath.trim())}?${params}`;
            listings.push({
                'url': fullUrl,
            })
        }
    });

    const nextPageLinkPortion = $('ul.pagination li#pagNext').find('a').attr('href');
    const lastPageLinkPortion = $('ul.pagination li#pagLast').find('a').attr('href');

    const nextPageNum = parseInt(nextPageLinkPortion.split('?page=')[1]) + 1
    const lastPageNum = parseInt(lastPageLinkPortion.split('?page=')[1]) + 1

    const realNextPageNum = nextPageNum + count

    if (realNextPageNum > lastPageNum) {
        return listings
    }

    const nextPageLink = `https://www.svp.ie${nextPageLinkPortion}`;
    count++

    return getListings(address, searchTerm, nextPageLink);
};

const scrapePage = async ({ url, $, existingData }) => {
    // const response = await request({
    //     resolveWithFullResponse: true,
    //     uri: encodeURI(url),
    // });
    // const $ = cheerio.load(response.body);

    const title = $('#ctl00_ctxM').next().text().trim()
    let formattedAddress = $('table.TextContent tbody tr:nth-child(2)').text().trim().split(':')[1].trim();
    const description = $('div.TextContent').html().trim();
    const company = 'St. Vincent De Paul';

    const data = {
        url,
        title,
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
