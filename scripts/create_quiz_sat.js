const db = require('../lib/db');
const courses = require('../lib/courses');
const tongues = require('../lib/tongues');

const SAT = 'en-sat';
const IPA = 'en-ipa';

async function main() {
  const connection = await db.getConnection();
  const courseName = 'Quiz SAT words';

  await db.models['course'].deleteOne({ id: courseName });

  const sats = await db.findAll(SAT);
  const content = await getContent(sats);

  await courses.put(courseName, {
    type: 'quiz',
    description: 'Quiz from 1000 SAT words',
    tags: ['quiz', 'SAT'],
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

      return {
        text: `${sat.data.def}`,
        data: {
          duration: 10,
          buttons: ['skip'],
          contextData: {
            type: 'QUIZ',
            entity: word,
            answer: word,
          },
        },
      };
    }),
  );
}

main();
