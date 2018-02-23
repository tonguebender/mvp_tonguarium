const fs = require('fs');
const db = require('../lib/db');
const tongues = require('../lib/tongues');

const TONGUE = 'en-misspell';

async function processMisspell(rows) {
  console.log(rows.length);
  const batch = rows.splice(0, 1000);

  for (let row of batch) {
    if (!row) continue;
    let { id, note } = getData(row);

    try {
      await tongues.put(TONGUE, id, { note });
    } catch (e) {
      console.log('Dupl:', id);
    }
  }

  if (rows.length) {
    await processMisspell(rows);
  }
}

function getData(row) {
  const [ id, note ] = row.split(' - ');

  return {
    id: id.toLowerCase(),
    note: note || ''
  }
}

async function run() {
  const connection = await db.getConnection();

  const file = fs.readFileSync('./scripts/_data/misspelled.txt').toString();
  const rows = file.split('\n');

  await processMisspell(rows);

  connection.close(() => {console.log('closed')})
}

run();
