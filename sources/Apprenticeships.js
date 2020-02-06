const { initPuppeteer } = require('../puppeteer');

let listingUrl = 'https://www.apprenticeshipjobs.ie/#/home/index/&/pg/1/ln/10/sdir/undefined/scol/7';

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const { browser, page } = await initPuppeteer({
        defaultViewport: null,
        slowMo: 100
    });

    let listings = []

    try {
        await new Promise(async (resolve, reject) => {
            try {
                setTimeout(() => {
                    console.log('Timeout exceeded');
                    resolve();
                }, 270000)

                await page.goto(pageUrl, {
                    timeout: 0,
                    waitUntil: "networkidle0"
                });

                await page.waitForSelector('#cookie_button');
                await page.click('#cookie_button')

                while (true) {
                    await page.waitForSelector('#job-search > tbody > tr > td:nth-child(2)');
                    await page.waitForSelector('#job-search_next');
                    const dataPerPage = await page.evaluate(() => {
                        const urlsPerPage = [];
                        const urlElements = document.querySelectorAll('#job-search > tbody > tr > td:nth-child(2)');
                        let url_portion, url
                        urlElements.forEach((item) => {
                            url_portion = item.querySelector('a').getAttribute('href').trim();
                            url = `https://www.apprenticeshipjobs.ie/${url_portion}`;

                            urlsPerPage.push({
                                url: url
                            });
                        });

                        return {url: urlsPerPage}
                    });

                    listings = listings.concat(dataPerPage.url);
                    const nextPageElement = await page.$('#job-search_next');
                    const nextPageDisabledElement = await page.$('.paginate_button.next.disabled');

                    if (nextPageDisabledElement == null) {
                        nextPageElement.click()
                    }
                    else {
                        break;
                    }
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });

        browser.close();

        return listings

    } catch(error) {
        console.log(error)
        return listings
    }
};

const scrapePage = async ({ url, $, existingData }) => {
    const { browser, page } = await initPuppeteer({
        defaultViewport: null,
        slowMo: 100
    });

    await page.goto(url)
    await page.waitForSelector('#placeholder-core > div.container-fluid.p-3')
    const title = await page.$eval('#desc > p:nth-child(1)', el=>el.innerText)
    const company = await page.$eval('#company', el=>el.innerText)
    const description = await page.$eval('#desc', el=>el.outerHTML)
    const formattedAddressList = []
    let address
    for (let x=0; x<4; x++) {
        address = await page.$eval(`#add${x+1}`, el => el.value);
        if (address !== '') {
            formattedAddressList.push(address)
        }
    }

    const formattedAddress = formattedAddressList.join(', ')

    const data = {
        url,
        title,
        description,
        formattedAddress,
        company,
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
