const axios = require('axios');
const SKYENG_URL = 'https://dictionary.skyeng.ru/api/public/v1/words/search?_format=json&search=';

function getURL(id) {
  return `${SKYENG_URL}${id}`;
}

function get(id) {
  return axios.get(getURL(id)).then(res => {
    const data = res.data.filter(row => row.text === id)[0];

    if (data && data.meanings) {
      const meaning = data.meanings[0];

      return {
        image: meaning.imageUrl,
        audio: meaning.soundUrl,
      };
    }
  }, err => {
    console.log('error', err);
  });
}

function getRaw(id) {
  return axios.get(getURL(id)).then(res => {
    return res.data;
  }, err => {
    console.log('error', err);
  });
}

module.exports = {
  get,
  getRaw,
};
