WORDLE SOLVER
======

I was wondering if you could solve every Wordle puzzle with a bit of code, and you can! It's not completely straightforward, you need to apply at least some heuristics to correctly select your guesses, but it's perfectly possible.
The general idea is to guess the word which will give us the most information, so I try to choose the word whose letters appear the most. Each step, you filter the possible words and repeat the process.

Done with React & Tailwind.


You can play Wordle [here](https://www.powerlanguage.co.uk/wordle/).
