const request = require('request-promise');
const cheerio = require('cheerio')

const getMissingKeys = (item) => {
  return ['title', 'description', 'company', 'url'].map((key) => {
    if (!item[key]) {
      return key;
    }
    return null;
  }).filter(Boolean);
};

const isValidItem = (item) => {
  const keys = getMissingKeys(item);
  if (keys.length) {
    console.log('Item has missing keys: ', keys.toString());
    return false;
  }
  return true;
};

const getPage = async ({
  url,
  loadCheerio = true,
  html: passedHtml,
  ...requestOptions
} = {}) => {
  try {
    if (passedHtml) {
      return {
        html: passedHtml,
        $: cheerio.load(passedHtml),
      };
    }
    const { body: html, request: { uri: { href: resolvedUrl } } } = await request({
      resolveWithFullResponse: true,
      uri: url,
      ...requestOptions,
    });
    if (loadCheerio) {
      const $ = cheerio.load(html);
      return { $, html, resolvedUrl };
    }
    return { html, resolvedUrl };
  } catch (error) {
    throw new Error(`Request error: ${url}
      ${error.message}
    `);
  }
};

module.exports = { isValidItem, getPage };
