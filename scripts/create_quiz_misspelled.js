const db = require('../lib/db');
const quizzes = require('../lib/quizzes');
const tongues = require('../lib/tongues');

const DICT = 'en-gb-dict';
const MISSPELLS = 'en-misspell';
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

  const misspells = await db.findAll(MISSPELLS);
  const content = await getContent(misspells);

  try {
    await createQuiz({
      id: 'misspelled words',
      description: 'Often misspelled words test',
      tags: ['Quiz', 'misspell'],
      content
    });
  } catch(e) {
    console.log('Put error:', e);
  }

  connection.close(() => {console.log('closed')})
}

async function getContent(misspells) {
  return Promise.all(misspells.map(async (misspell) => {
    const answer = misspell.id.toLowerCase();

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
      note: misspell.data.note
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
      clue[i] = '\\*';
    }

    return clue;
  }, []).join('');
}


run();
