const fetch = require('node-fetch');
var rootCas = require('ssl-root-cas/latest').create();

rootCas.addFile(__dirname + '/../config/ssl/intermediate.pem');

require('https').globalAgent.options.ca = rootCas;

function removeByteOrderMark(str){
  return str.replace(/^\ufeff/g,"")
}

async function getCodes () {
  const res = await fetch('https://www.weatherapi.com/docs/conditions.json');
  const textCodes = await res.text();
  const codes = JSON.parse(removeByteOrderMark(textCodes));
  return codes;
}

module.exports = getCodes;

