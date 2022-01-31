import './style.css';
import React, {
  useState,
  useEffect,
}                 from 'react';
import {
  getBestGuess,
  processResult,
}                 from './lib/solver.js';
import WordleWord from './compoments/WordleWord.js';

const initial_filter = {
  known: ['','','','',''],
  found: {},
  counts: {},
  incorrect: [[],[],[],[],[]],
};

const text_strings = (locale, guess) => ({
  'tutorial': locale === 'en' ?
    (<div>
      Try entering <span style={{fontWeight: 800}}>{guess}</span> at&nbsp;
      <a href="https://www.powerlanguage.co.uk/wordle/" target="_blank" rel="noreferrer"
        className="no-underline hover:underline text-sky-500 font-semibold"
      >Wordle</a>, then click each letter to input the result:
    </div>) :
    (<div>
      Prueba a usar <span style={{fontWeight: 800}}>{guess}</span> en&nbsp;
      <a href="https://wordle.danielfrg.com/" target="_blank" rel="noreferrer"
        className="no-underline hover:underline text-sky-500 font-semibold"
      >Wordle</a> y luego pulsa cada letra para introducir el resultado:
    </div>),
  'error': locale === 'en' ?
    (<div>It seems something went wrong. Are you sure you input the results correctly?</div>) :
    (<div>Parece que ha habido un error. ¿Seguro que has introducido los resultados correctamente?</div>),
});

const getLocale = url => {
  const new_locale = url.split('?locale=').at(-1);
  if (['es', 'en'].includes(new_locale)) {
    return new_locale;
  }
  return 'en';
};

const App = () => {
  const [ attempt, setAttempt          ] = useState(1);
  const [ filter, setFilter            ] = useState(initial_filter);
  const [ guess, setGuess              ] = useState('');
  const [ results, setResults          ] = useState(['b','b','b','b','b']);
  const [ prev_guesses, setPrevGuessed ] = useState([]);
  const [ prev_results, setPrevResults ] = useState([]);

  const locale = getLocale(window.location.href);

  useEffect(() => {
    const next_guess = getBestGuess(filter, attempt, locale);
    setGuess(next_guess);
    setResults(['b','b','b','b','b']);
  }, [attempt, filter, locale]);

  const valid_results = results.filter(x => x).length === 5;

  return (<div className="App">
    <div className="flex flex-col h-screen">
      <header>
        <div className="flex flex-row mx-2 sm:mx-auto max-w-screen-sm py-2 border-b">
          <div className="flex-auto text-center">
            <h1 className="uppercase font-extrabold text-4xl tracking-wider">
              WORDLE SOLVER
            </h1>
          </div>
        </div>
        <div style={{margin: '1em auto', display: 'flex', width: '7em'}}>
          <a href="/?locale=en"><img src="/en.png" alt="github"
            style={{height: "1em", padding: "0em 1em", cursor: "pointer"}}
          /></a>
          <a href="/?locale=es"><img src="/es.png" alt="github"
            style={{height: "1em", padding: "0em 1em", cursor: "pointer"}}
          /></a>
        </div>
      </header>
      <main className="container mx-auto my-auto max-w-xs">
        {guess && text_strings(locale, guess)['tutorial']}
        {guess === undefined && text_strings(locale)['error']}
        <div className="m-3">
          <div className="flex flex-col gap-1">
            {prev_guesses.map((prev_guess, i) => (<WordleWord
              key={prev_guess + i}
              word={prev_guess}
              word_result={prev_results[i]}
              disabled
            />))}
            {guess && <WordleWord
              word={guess}
              word_result={results}
              setResults={setResults}
            />}
          </div>
        </div>
        {guess && <button
          className="text-white bg-known font-bold text-sm px-6 py-3 rounded hover:shadow-lg"
          style={{
            opacity: valid_results ? '1' : '0.5',
            cursor: valid_results ? 'pointer' : '',
          }}
          onClick={() => {
            if (valid_results) {
              setPrevGuessed(prev_guesses.concat(guess));
              setPrevResults(prev_results.concat([results]));
              if (results.filter(r => r === 'g').length === 5) {
                setGuess('');
              } else {
                setFilter(processResult(results, guess, filter));
                setAttempt(attempt + 1);
              }
            }
          }}
        >{locale === 'en' ? 'NEXT' : 'SIGUIENTE'}</button>}
      </main>
      <div className="flex flex-row mx-auto max-w-screen-sm border-t py-2">
        {locale === 'en' ? 'Made by Marah' : 'Hecho por Marah'}
        <a href="https://github.com/CMarah" target="_blank" rel="noreferrer">
          <img src="/githubicon.png" alt="github"
            style={{height: "1.5em", padding: "0em 1em", cursor: "pointer"}}
          />
        </a>
      </div>
    </div>
  </div>);
};
export default App;
