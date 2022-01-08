const prompt    = require('prompt-sync')();
const word_list = require('./word_list.js');

const getStatus = (guess, secret_word) =>
  guess.split('').map((guess_letter, position) => {
    if (!secret_word.includes(guess_letter)) return 'b';
    if (guess_letter === secret_word[position]) return 'g';
    const correct_positions_not_guessed = secret_word.split('').map((letter, index) => {
      if (letter === guess[index]) return null;
      if (letter !== guess_letter) return null;
      return index;
    }).filter(index => index !== null);
    const guess_positions_not_correct = guess.split('').map((letter, index) => {
      if (letter !== guess_letter) return null;
      if (letter === secret_word[index]) return null;
      return index;
    }).filter(index => index !== null);
    if (guess_positions_not_correct.length <= correct_positions_not_guessed.length) {
      return 'y';
    }
    const guess_letter_number = guess_positions_not_correct.indexOf(position);
    return (guess_letter_number + 1) <= correct_positions_not_guessed.length ? 'y' : 'b';
  }).join('');

const processResult = (result, guess, prev_filters) => {
  const known = prev_filters.known.map((known_letter, pos) => {
    if (known_letter) return known_letter;
    if (result[pos] === 'g') return guess[pos];
    return '';
  });
  let found     = prev_filters.found;
  let missing   = prev_filters.missing;
  let incorrect = prev_filters.incorrect;
  result.split('').forEach((letter_status, position) => {
    const letter = guess[position];
    if (letter_status === 'y') {
      const new_num_found = guess.split('').filter(
        (gletter, pos) => gletter === letter && result[pos] === 'y'
      ).length;
      const num_found = found.join('').split(letter).length - 1;
      for (let i = 0; i < (new_num_found - num_found); ++i) {
        found.push(letter);
      }
      incorrect[position].push(letter);
    } else if (letter_status === 'b') {
      if (!known.includes(letter)) {
        missing.push(letter);
      } else if (!found.includes(letter)) {
        incorrect = incorrect.map((incorrect_at_pos, pos) => {
          if (known[pos] === letter) return incorrect_at_pos;
          return incorrect_at_pos.concat(letter);
        });
      } else {
        incorrect[position].push(letter);
      }
    }
  });
  return { known, found, missing, incorrect };
};

const getUniqueLetters = word => [...new Set(word.split(''))];

const isValidWord = (known, found, missing, incorrect) => word => {
  if (!known.every((letter, position) => !letter || letter === word[position])) return false;
  if (!incorrect.every(
    (letters, position) => !letters.some(letter => letter === word[position])
  )) return false;
  const found_and_missing = found.filter(letter => missing.includes(letter));
  if (found_and_missing.some(letter => {
    const times_found = found.join('').split(letter).length - 1;
    const appearances_word = word.split(letter).length - 1;
    return times_found !== appearances_word;
  })) return false;
  const filtered_found   = found.filter(letter => !found_and_missing.includes(letter));
  const filtered_missing = missing.filter(letter => !found_and_missing.includes(letter));
  if (!filtered_found.every(letter => word.includes(letter))) return false;
  return filtered_missing.every(letter => {
    if (!word.includes(letter)) return true;
    const letter_positions_in_known = known.map(
      (known_letter, pos) => letter === known_letter ? pos: null
    ).filter(pos => pos !== null);
    if (!letter_positions_in_known) return false;
    return !word.split('').some((word_letter, pos) =>
      word_letter === letter && !letter_positions_in_known.includes(pos)
    );
  });
};

const getLetterOccurrences = word_list => word_list.reduce((occurrences, word) => {
  getUniqueLetters(word).forEach(letter => {
    if (!occurrences[letter]) occurrences[letter] = {};
    occurrences[letter].total = (occurrences[letter].total || 0) + 1;
  });
  word.split('').forEach((letter, position) => {
    occurrences[letter][position] = (occurrences[letter][position] || 0) + 1;
  });
  return occurrences;
}, {});

const getPositionalScore = (word, letter_occurrences, attempts, filters) => {
  return word.split('').reduce((total_score, letter, position) => {
    if (attempts < 6 && (
      filters.found.includes(letter) ||
      filters.known.filter(x => x).includes(letter)
    )) return total_score;
    if (!letter_occurrences[letter]) return total_score;
    const already_added = word.split('').slice(0, position).includes(letter);
    return total_score +
      (already_added ? 0 : letter_occurrences[letter].total) +
      letter_occurrences[letter][position]/50;
  }, 0);
};

const getScore = (word, letter_occurrences, attempts, filters) => {
  return word.split('').reduce((total_score, letter, position) => {
    if (attempts < 6 && filters.known.filter(x => x).includes(letter)) return total_score;
    if (attempts === 2 && filters.found.includes(letter)) return total_score;
    if (!letter_occurrences[letter]) return total_score;
    const already_added = word.split('').slice(0, position).includes(letter);
    return [
      total_score[0] + (already_added ? 0 : letter_occurrences[letter].total),
      total_score[1] + (letter_occurrences[letter][position] || 0)
    ];
  }, [0, 0]);
};

const getValidWordList = (filters, word_list, attempts) => {
  const { known, found, missing, incorrect } = filters;
  return word_list.filter(isValidWord(known, found, missing, incorrect));
};

const getBestWord = (filters, word_list, attempts) => {
  const valid_word_list = getValidWordList(filters, word_list, attempts);
  //console.log('v', valid_word_list, attempts);
  const letter_occurrences = getLetterOccurrences(valid_word_list);
  const word_pool = attempts < 6 ? word_list : valid_word_list;
  const best_word = word_pool.reduce(
    ({ word, score, positional_score }, next_word) => {
      const [ normal_score, pos_score ] = getScore(
        next_word, letter_occurrences, attempts, filters,
      );
      if (normal_score > score || (
        normal_score === score && pos_score > positional_score
      )) return {
        word: next_word,
        score: normal_score,
        positional_score: pos_score,
      };
      return { word, score, positional_score };
    },
  { score: 0, word: valid_word_list[0], positional_score: 0 });
  return best_word.word;
};

// Last change: line 117
// IDEA: score given by distance to half of total words

const getNumberOfAttempts = word_to_guess => {
  console.log('W', word_to_guess);
  let filters = {
    known: ['','','','',''],
    found: [],
    missing: [],
    incorrect: [[],[],[],[],[]],
  };
  let result = 'bbbbb';
  let attempts = 0;
  while (result !== 'ggggg') {
    attempts++;
    const best_word = getBestWord(filters, word_list, attempts);
    //console.log('Trying:', best_word, word_to_guess);
    result = getStatus(best_word, word_to_guess);
    //console.log('result:', result);
    filters = processResult(result, best_word, filters);
    //console.log(filters);
    //console.log('');
  }
  return attempts;
};
//console.log(getNumberOfAttempts('babes'));
//Failed before: dadas, daddy, cully, wawas, animi

const num_failed = word_list.slice(0, 15000).filter(x => getNumberOfAttempts(x) > 6);
console.log(num_failed, num_failed.length);
