const db = require('../lib/db');
const courses = require('../lib/courses');
const tongues = require('../lib/tongues');

const SAT = 'en-sat';
const IPA = 'en-ipa';

async function main() {
  const connection = await db.getConnection();
  const courseName = 'SAT words';

  await db.models['course'].deleteOne({ id: courseName });

  const sats = await db.findAll(SAT);
  const content = await getContent(sats);

  await courses.put(courseName, {
    description: '1000 SAT words',
    tags: ['SAT'],
    content,
  });

  connection.close(() => {
    console.log('closed');
  });
}

async function getContent(sats) {
  return Promise.all(
    sats.map(async sat => {
      const word = sat.id.toLowerCase();

      let ipa = '';
      try {
        const ipaDoc = await tongues.get(IPA, word);
        ipa = ` /${ipaDoc.data.ipa}/`;
      } catch (e) {
        console.log('> no ipa', word);
      }

      return {
        text: `*${word}*${ipa} ${sat.data.def}\n${sat.data.examples.join('\n')}`,
        data: {
          duration: 30,
          contextData: {
            type: 'definition',
            id: word,
          },
        },
      };
    }),
  );
}

main();
