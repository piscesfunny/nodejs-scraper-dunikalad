const request = require('request-promise');
const cheerio = require('cheerio')
const moment = require('moment');
const requiredKeys = ['title', 'formattedAddress', 'description', 'company', 'url'];

const optionalKeys = ['salaryString', 'closesAt', 'jobId', 'jobType'];

const getMissingKeys = (item) => {
  return requiredKeys.map((key) => {
    if (!item[key]) {
      return key;
    }
    return null;
  }).filter(Boolean);
};

const isValidItem = (item) => {
  const keys = getMissingKeys(item);
  if (keys.length) {
    throw new Error('Item has missing keys: ', keys.toString());
  }
  Object.keys(item).forEach((key) => {
    if (![...requiredKeys, ...optionalKeys].includes(key)) {
      throw new Error (`Item has invalid key - ${key}`);
    }
  });
  if (item.closesAt) {
    if (item.closesAt instanceof Date) {
      return;
    }

    if (typeof item.closesAt === 'string' && moment(item.closesAt).isValid()) {
      return;
    } 
    throw new Error (`Item has invalid closesAt value - ${item.closesAt}`);
  }
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
