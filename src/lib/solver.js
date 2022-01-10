const word_list = require('./word_list.js');
const target_words = require('./target_words.js');

const processResult = (result, guess, prev_filters) => {
  const letters_info = guess.split('').reduce((info, letter, position) => {
    const li = { position, result: result[position] };
    info[letter] = (info[letter] || []).concat(li);
    return info;
  }, {});
  let known     = prev_filters.known;
  let found     = prev_filters.found;
  let counts    = prev_filters.counts;
  let incorrect = prev_filters.incorrect;
  Object.entries(letters_info).forEach(([letter, infos]) => {
    infos.filter(info => info.result === 'g').forEach(info => {
      known[info.position] = letter;
    });
    const num_found = infos.filter(info => ['g','y'].includes(info.result)).length;
    if (infos.some(info => info.result === 'b')) {
      counts[letter] = num_found;
    } else {
      if (!found[letter] || found[letter] < num_found) {
        found[letter] = num_found;
      }
    }
    infos.filter(info => info.result === 'y').forEach(info => {
      incorrect[info.position].push(letter);
    });
  });
  return { known, found, counts, incorrect };
};

const initial_letter_counts = 'abcdefghijklmnopqrstuvwxyz'.split('').reduce(
  (counts, letter) => ({ ...counts, [letter]: 0 }), {}
);
const getWordLetterCounts = word => word.split('').reduce((counts, letter) => ({
  ...counts,
  [letter]: counts[letter] + 1,
}), initial_letter_counts);

const isValidWord = (known, found, counts, incorrect) => word => {
  if (known.some((letter, position) => letter && letter !== word[position])) return false;
  if (incorrect.some(
    (letters, position) => letters.some(letter => letter === word[position])
  )) return false;
  const word_letter_counts = getWordLetterCounts(word);
  return Object.entries(word_letter_counts).every(([letter, count]) => {
    if (counts[letter] !== undefined) {
      return counts[letter] === count;
    }
    if (found[letter] !== undefined) {
      return found[letter] <= count;
    }
    return true;
  });
};

const getUniqueLetters = word => [...new Set(word.split(''))];
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

const getScore = (word, letter_occurrences, attempts, filters) => {
  return word.split('').reduce((total_score, letter, position) => {
    if (attempts < 6 && filters.known.filter(x => x).includes(letter)) return total_score;
    if (attempts <= 3) {
      if (Object.keys(filters.found).includes(letter)) return total_score;
    }
    if (!letter_occurrences[letter]) return total_score;
    const already_added = word.split('').slice(0, position).includes(letter);
    return [
      total_score[0] + (already_added ? 0 : letter_occurrences[letter].total),
      total_score[1] + (letter_occurrences[letter][position] || 0)
    ];
  }, [0, 0]);
};

const getValidWordList = (filters, words, attempts) => {
  const { known, found, counts, incorrect } = filters;
  return words.filter(isValidWord(known, found, counts, incorrect));
};

const getBestGuess = (filters, attempts) => {
  const valid_word_list = getValidWordList(filters, target_words, attempts);
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

export {
  getBestGuess,
  processResult,
};
