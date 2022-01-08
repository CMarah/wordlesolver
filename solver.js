const prompt = require('prompt-sync')();

const word_list = require('./word_list.js');

const getUniqueLetters = word => [...new Set(word.split(''))];

const isValidWord = (known, found, missing, incorrect) => word =>
  known.every((letter, position) => !letter || letter === word[position]) &&
  found.every(letter => word.includes(letter)) &&
  missing.every(letter => !word.includes(letter)) &&
  incorrect.every((letters, position) => !letters.some(letter => letter === word[position]));

const getLetterOccurrences = word_list => word_list.reduce((occurrences, word) => {
  getUniqueLetters(word).forEach(letter => {
    occurrences[letter] = (occurrences[letter] || 0) + 1;
  });
  return occurrences;
}, {});

const getScore = (word, letter_occurrences) => getUniqueLetters(word).reduce(
  (total_score, letter) => total_score + letter_occurrences[letter], 0
);

const giveBestWord = (known, found, missing, incorrect, word_list) => {
  const valid_word_list = word_list.filter(isValidWord(known, found, missing, incorrect));
  console.log('v', valid_word_list);
  const letter_occurrences = getLetterOccurrences(valid_word_list);
  return valid_word_list.reduce(
    ({ word, score }, next_word) => {
      const next_word_score = getScore(next_word, letter_occurrences);
      return next_word_score > score ?
        { word: next_word, score: next_word_score } :
        { word, score };
    },
  { score: 0 }).word;
};

const main = () => {
  let known = ['','','','',''];
  let found = [];
  let missing = [];
  let incorrect = [[],[],[],[],[]];
  let status = '';

  while (status !== 'ggggg') {
    console.log('i', known, found, missing, incorrect);
    const best_word = giveBestWord(known, found, missing, incorrect, word_list);
    console.log(`Try using: "${best_word}"`);
    status = prompt('What was the result? ');
    status.split('').forEach((letter_status, position) => {
      const letter = best_word[position];
      if (best_word.slice(0, position).includes(letter)) return;
      if (letter_status === 'g') {
        known[position] = letter;
      } else if (letter_status === 'y') {
        found.push(letter);
        incorrect[position].push(letter);
      } else if (letter_status === 'b') {
        missing.push(letter);
      }
    });
    console.log('');
  }
  console.log('Done :)');
};
main();
