const fs = require('fs');
const db = require('../lib/db');
const tongues = require('../lib/tongues');

const TONGUE = 'en-ipa';

async function processIPA(rows) {
  console.log(rows.length);
  const batch = rows.splice(0, 1000);

  for (let row of batch) {
    if (!row) continue;
    let { id, ipa } = getData(row);

    try {
      await tongues.put(TONGUE, id, { ipa });
    } catch (e) {
      console.log('Dupl:', id);
    }
  }

  if (rows.length) {
    await processIPA(rows);
  }
}

function getData(row) {
  const [ id, phones ] = row.split('\t');
  const ipa = phones.split(' ').map(phone => phoneToChar(phone)).join('');

  return {
    id: id.toLowerCase(),
    ipa
  }
}

function phoneToChar(phone) {
  return {
    AA: 'ɑ',
    AE: 'æ',
    AH: 'ʌ',
    AO: 'ɔ',
    AW: 'aʊ',
    AX: 'ə',
    AY: 'aɪ',
    EH: 'ɛ',
    ER: 'ɝ',
    EY: 'eɪ',
    IH: 'ɪ',
    IX: 'ɨ',
    IY: 'i',
    OW: 'oʊ',
    OY: 'ɔɪ',
    UH: 'ʊ',
    UW: 'u',
    B:'b',
    CH:'tʃ',
    D:'d',
    DH:'ð',
    DX:'ɾ',
    EL:'l̩',
    EM:'m̩',
    EN:'n̩',
    F:'f',
    G:'ɡ',
    HH:'h',
    JH:'dʒ',
    K:'k',
    L:'l',
    M:'m',
    N:'n',
    P:'p',
    Q:'ʔ',
    R:'ɹ',
    S:'s',
    SH:'ʃ',
    T:'t',
    TH:'θ',
    V:'v',
    W:'w',
    WH:'ʍ',
    Y:'j',
    Z:'z',
    ZH:'ʒ',
  }[phone];
}

async function run() {
  const connection = await db.getConnection();

  const file = fs.readFileSync('./scripts/_data/ipa.txt').toString();
  const rows = file.split('\n');

  await processIPA(rows);

  connection.close(() => {console.log('closed')})
}

run();
