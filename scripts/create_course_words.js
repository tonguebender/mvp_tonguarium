const db = require('../lib/db');
const courses = require('../lib/courses');
const tongues = require('../lib/tongues');

const DICT = 'en-gb-def';

async function createCourse({ id, description, tags, words }) {
  const content = await getContent(words);

  console.log(JSON.stringify(content, null, ' '));
  await courses.put(id, {
    description,
    tags,
    content
  });

  console.log('ok');
}

async function getContent(words) {
  const content = [];
  const quizzes = [{
    text: `Let\'s test you.`,
    data: {
      duration: 1
    }
  }];

  for (const word of words) {
    console.log('>', word);
    try {
      const doc = await tongues.get(DICT, word);
      const ipaDoc = await tongues.get('en-ipa', word);
      const def = doc.data.meanings && doc.data.meanings[0].def;

      content.push({
        text: `*${word}* /${ipaDoc.data.ipa}/\n${def}`,
        data: {
          duration: 30,
          buttons: ['image', 'audio', 'synonyms', 'translation', 'ipa', 'examples'],
          contextData: {
            type: 'definition',
            id: word,
          }
        }
      });

      quizzes.push({
        text: `What defines "${def}"?`,
        data: {
          duration: 10,
          contextData: {
            type: 'quiz',
            answer: word,
          }
        }
      });
    } catch (e) {
      console.log('-');
    }
  }

  return content.concat(quizzes);
}

async function main() {
  const connection = await db.getConnection();
  const courseName = 'test';

  await db.models['course'].deleteOne({ id: courseName });

  await createCourse({
    id: courseName,
    description: 'context test',
    tags: ['test'],
    words: ['tongue', 'bender']
  });

  connection.close(() => {console.log('closed')})
}

main();
