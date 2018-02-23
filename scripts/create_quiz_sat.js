const db = require('../lib/db');
const quizzes = require('../lib/quizzes');
const tongues = require('../lib/tongues');

const DICT = 'en-gb-dict';
const SAT = 'en-sat';
const IPA = 'en-ipa';

async function createQuiz({ id, description, tags, content }) {
  await quizzes.put(id, {
    description,
    tags,
    content
  });

  console.log('ok');
}

async function run() {
  const connection = await db.getConnection();

  const sats = await db.findAll(SAT);
  const content = await getContent(sats);

  try {
    await createQuiz({
      id: 'sat words',
      description: '1000 SAT words',
      tags: ['Quiz', 'SAT'],
      content
    });
  } catch(e) {
    console.log('Put error:', e);
  }

  connection.close(() => {console.log('closed')})
}

async function getContent(sats) {
  return Promise.all(sats.map(async (sat) => {
    const answer = sat.id.toLowerCase();

    let def = '';
    try {
      const doc = await tongues.get(DICT, answer);
      const pos = Object.keys(doc.data)[0];
      const shortDef = doc.data[pos][0].split(';')[0];
      def = `*(${pos})* ${shortDef};`
    } catch (e) {
      console.log('Error:', e);
    }

    let transcription;
    try {
      const doc = await tongues.get(IPA, answer);
      transcription = `\n_${doc.data.ipa}_`;
    } catch (e) {
      console.log('no trans:', answer);
      transcription = `_${getClue(answer)}_`;
    }

    return {
      text: `${def}${transcription}`,
      answer,
      note: sat.data.examples.join('\n')
    }
  }));
}

function getClue(word) {
  const letters = word.split('');
  const len = letters.length;
  const pos1 = Math.trunc(Math.random() * (len - 2)) + 1;
  const pos2 = Math.trunc(Math.random() * (len - 2)) + 1;

  return letters.reduce((clue, char, i) => {
    if (i === 0 || i === (len - 1) || i === pos1 || i === pos2) {
      clue[i] = letters[i];
    } else {
      clue[i] = '\*';
    }

    return clue;
  }, []).join('');
}


run();
