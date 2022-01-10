import '../style.css';

const POSSIBLE_RESULTS = ['b', 'y', 'g'];
const WordleLetter = ({
  letter,
  result,
  disabled,
  setResult,
}) => {
  const bg_classes = ['bg-missing', 'bg-found', 'bg-known'];
  const letter_bg = bg_classes[POSSIBLE_RESULTS.indexOf(result)] || 'bg-unset';
  const letterClicked = () => {
    if (!disabled) {
      const current_result_index = POSSIBLE_RESULTS.indexOf(result);
      const next_result = POSSIBLE_RESULTS[(current_result_index + 1)%3];
      setResult(next_result);
    }
  };
  return (<div className={'tile inline-flex w-full text-2xl tiny:text-4xl uppercase font-bold select-none border-2 border-gray-500 text-white ' + letter_bg}
    style={{cursor: disabled ? '' : 'pointer'}}
    onClick={letterClicked}
  >{letter}</div>);
};

const WordleWord = ({
  word,
  word_result,
  disabled,
  setResults,
}) => {
  const letters = word.split('');
  return <div className="flex flex-row gap-1" style={{opacity: disabled ? "0.6" : "1"}}>
    {letters.map((letter, i) => (<WordleLetter
      key={letter + i}
      letter={letter}
      result={word_result[i]}
      disabled={disabled}
      setResult={letter_result => setResults(
        word_result.map((r, j) => i === j ? letter_result : r)
      )}
    />))}
  </div>;
};
export default WordleWord;
