const fs = require('fs');
const db = require('../lib/db');
const tongues = require('../lib/tongues');

const TONGUE = 'en-sat';

function processDATA(rows) {
  const res = [];

  while (rows.length) {
    const row = rows.shift();

    if (row && row.match(/^\d{1,4}./)) {
      const [, id, def] = row.match(/^\d{1,4}. (\S+) (.*)/);
      res.push({ id, def, examples: [] });
    } else {
      res[res.length - 1].examples.push(row);
    }
  }

  return res;
}

async function processSAT(rows) {
  console.log(rows.length);
  const batch = rows.splice(0, 1000);

  for (let row of batch) {
    if (!row) continue;
    let { id, def, examples } = row;

    try {
      await tongues.put(TONGUE, id, { def, examples });
    } catch (e) {
      console.log('Dupl:', id);
    }
  }

  if (rows.length) {
    await processSAT(rows);
  }
}

async function run() {
  const connection = await db.getConnection();

  const file = fs.readFileSync('./scripts/_data/sat.txt').toString();
  const rows = file.split('\n');

  const data = processDATA(rows);
  await processSAT(data);

  connection.close(() => {
    console.log('closed');
  });
}

run();
