const { initPuppeteer } = require('../puppeteer');

let listingUrl = 'https://careers.ryanair.com/search/#search/page=1&location=ireland';

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const { browser, page } = await initPuppeteer({
        defaultViewport: null,
        // slowMo: 100
    });

    let listings = []
    try {

        await new Promise(async (resolve, reject) => {
            try {

                await page.goto(listingUrl);
                await page.waitForSelector('.ryr-cookie-popup__close-btn');
                await page.click('.ryr-cookie-popup__close-btn');

                let pageCount, pageNumber

                while (true) {
                    let dataPerPage = await page.evaluate(() => {
                        let urlsPerPage = [];
                        const pageCount = document.querySelectorAll('#results-pagination li').length;
                        const pageNumber = document.querySelector('#results-pagination li.active a').getAttribute('data-page').trim();

                        let urlElements = document.querySelectorAll('div.view-details');
                        let url_portion, url
                        urlElements.forEach((item) => {
                            if (pageNumber > 1) {
                                url_portion = item.querySelector('a').getAttribute('data-job-id').trim();
                                url = `https://careers.ryanair.com/search/#job/${url_portion}`;
                            } else {
                                url_portion = item.querySelector('a').getAttribute('href').trim();
                                url = `https://careers.ryanair.com${url_portion}`;
                            }
                            urlsPerPage.push({
                                url: url
                            });
                        });

                        return {url: urlsPerPage, 'pageCount': pageCount, 'pageNumber': pageNumber}
                    });

                    listings = listings.concat(dataPerPage.url);
                    pageCount = dataPerPage.pageCount;
                    pageNumber = parseInt(dataPerPage.pageNumber);

                    if (pageNumber < pageCount) {
                        await Promise.all([
                            await page.goto(`https://careers.ryanair.com/search/#search/page=${pageNumber + 1}&location=ireland`),
                            await page.waitForSelector('div.view-details')
                        ])
                    }
                    else {
                        break;
                    }
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        })

        await browser.close();
        debugger

        return listings
    }
    catch(error) {
        console.log(error)
        return listings
    }
};

const scrapePage = async ({ url, $, existingData }) => {
    const { browser, page } = await initPuppeteer({
        defaultViewport: null,
        // slowMo: 100
    });
    const company = 'Ryanair';

    await page.goto(url)
    await page.waitForSelector('.ryr-cookie-popup__close-btn');
    await page.click('.ryr-cookie-popup__close-btn');

    await page.waitForSelector('.results');

    const result = await page.evaluate(() => {
        const baseElement = document.querySelector('.result-entry .row');
        const titleElement = baseElement.nextElementSibling;
        const title = titleElement.querySelector('div.col-xs-12 h3').innerText.trim();
        const locationElement = titleElement.nextElementSibling;
        const formattedAddress = locationElement.querySelector('div.col-sm-4 dl dd').innerText.trim();
        const otherElement = locationElement.nextElementSibling;

        const descriptionBaseElement = otherElement.querySelector('div h4')
        let descriptionElement = descriptionBaseElement.nextElementSibling;
        let description = descriptionElement.outerHTML.trim() + '\n';

        let fullDetail;
        while (true){
            descriptionElement = descriptionElement.nextElementSibling;
            fullDetail = descriptionElement.innerText.trim()
            if (fullDetail === 'Full Details')
                break

            description += descriptionElement.outerHTML.trim() + '\n';
        }

        const jobType = otherElement.querySelectorAll('table tbody tr')[1].querySelectorAll('td')[1].innerText.trim()

        return { title, formattedAddress, description, jobType }
    });

    const { title, formattedAddress, description, jobType } = result

    const data = {
        url,
        title,
        description,
        formattedAddress,
        company,
        jobType,
        ...existingData
    };

    await browser.close();
    debugger

    return data;
};

module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
