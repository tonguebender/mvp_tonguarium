const db = require('../lib/db');
const courses = require('../lib/courses');
const tongues = require('../lib/tongues');

const DICT = 'en-gb-dict';

async function createCourse({ id, description, tags, words }) {
  const content = await getContent(words);

  await courses.put(id, {
    description,
    tags,
    content
  });

  console.log('ok');
}

async function getContent(words) {
  const content = [];

  for (const word of words) {
    console.log('word', word);
    try {
      const doc = await tongues.get(DICT, word);
      const defs = Object.keys(doc.data).reduce((defs, pos) => {
        defs.push(`_(${pos})_ ${doc.data[pos]}`);
        return defs;
      }, []);

      content.push({
        tongue: DICT,
        text:
`*${doc.id}*
${defs.join('\n')}`

      });
    } catch (e) {
      console.log('-');
    }
  }

  return content;
}

async function run() {
  const connection = await db.getConnection();

  await createCourse({
    id: 'test',
    description: 'test desc',
    tags: ['test'],
    words: ['mother', 'was', 'washing', 'a', 'frame']
  });

  connection.close(() => {console.log('closed')})
}


run();
