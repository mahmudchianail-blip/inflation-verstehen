'use strict';
(() => {
  const data = window.INFLATION_DATA;
  const $ = id => document.getElementById(id);
  if (!data) return;
  data.lessons.forEach((lesson, index) => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const num = document.createElement('span'); num.className = 'num'; num.textContent = String(index + 1).padStart(2, '0');
    summary.append(num, document.createTextNode(lesson.title));
    const paragraph = document.createElement('p'); paragraph.textContent = lesson.text;
    details.append(summary, paragraph); $('lessons').append(details);
  });
  data.sources.forEach(source => {
    const li = document.createElement('li'); const a = document.createElement('a');
    a.href = source.url; a.textContent = source.name; li.append(a); $('sources-list').append(li);
  });

  let questions = [], current = 0, score = 0, answered = false, extra = false;
  function start(useExtra) {
    extra = useExtra; questions = data.quiz.slice(useExtra ? 3 : 0, useExtra ? 6 : 3);
    current = 0; score = 0;
    $('quiz-start').hidden = true; $('quiz-result').hidden = true; $('quiz-play').hidden = false;
    renderQuestion();
  }
  function renderQuestion() {
    answered = false; const q = questions[current];
    $('progress').textContent = `${extra ? 'Zusatzquiz' : 'Kurzquiz'} · Frage ${current + 1} von ${questions.length}`;
    $('progress-bar').style.width = `${(current + 1) / questions.length * 100}%`;
    $('question').textContent = q.question; $('answers').replaceChildren();
    $('feedback').hidden = true; $('next-question').hidden = true;
    q.options.forEach((text, index) => {
      const button = document.createElement('button'); button.className = 'answer'; button.type = 'button';
      const letter = document.createElement('span'); letter.className = 'answer-letter'; letter.textContent = String.fromCharCode(65 + index);
      const label = document.createElement('span'); label.textContent = text; button.append(letter, label);
      button.addEventListener('click', () => answer(index)); $('answers').append(button);
    });
    $('question').focus({ preventScroll: true });
  }
  function answer(index) {
    if (answered) return; answered = true;
    const q = questions[current], correct = index === q.correct; if (correct) score++;
    [...$('answers').children].forEach((button, i) => {
      button.disabled = true;
      if (i === q.correct) button.classList.add('correct');
      if (i === index && !correct) button.classList.add('wrong');
    });
    $('feedback').className = `feedback${correct ? '' : ' wrong'}`;
    $('feedback').textContent = `${correct ? 'Richtig.' : 'Noch nicht ganz.'} ${q.explanation}`;
    $('feedback').hidden = false;
    $('next-question').textContent = current === questions.length - 1 ? 'Ergebnis anzeigen' : 'Nächste Frage';
    $('next-question').hidden = false;
  }
  $('start-quiz').addEventListener('click', () => start(false));
  $('more-quiz').addEventListener('click', () => start(true));
  $('retry-quiz').addEventListener('click', () => start(false));
  $('next-question').addEventListener('click', () => {
    if (!answered) return;
    if (++current < questions.length) { renderQuestion(); return; }
    $('quiz-play').hidden = true; $('quiz-result').hidden = false;
    $('score').textContent = `${score} von ${questions.length} richtig`;
    $('score-message').textContent = score === questions.length ? 'Alle Antworten richtig. Du hast die Zusammenhänge erkannt.' : 'Gut, dass du mitgemacht hast. Die Erklärungen und die Themenübersicht helfen dir beim Wiederholen.';
    $('more-quiz').textContent = extra ? 'Zusatzfragen wiederholen' : 'Drei Zusatzfragen';
    $('score').focus({ preventScroll: true });
  });

  const currency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  const number = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
  function parseDecimal(value) {
    const input = value.trim();
    if (!/^\d+(?:[.,]\d+)?$/.test(input)) return NaN;
    return Number(input.replace(',', '.'));
  }
  function calculate(event) {
    if (event) event.preventDefault();
    const amount = parseDecimal($('amount').value), rate = parseDecimal($('rate').value), years = parseDecimal($('years').value);
    let error = '';
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) error = 'Bitte einen Betrag größer als 0 und bis 1.000.000 Euro eingeben. Verwende zum Beispiel 100,50 ohne Tausenderpunkt.';
    else if (!Number.isFinite(rate) || rate < 0 || rate > 100) error = 'Bitte eine jährliche Inflationsrate zwischen 0 und 100 Prozent eingeben.';
    else if (!Number.isInteger(years) || years < 0 || years > 50) error = 'Bitte einen Zeitraum zwischen 0 und 50 ganzen Jahren eingeben.';
    $('calc-error').textContent = error; $('calc-error').hidden = !error; $('calc-results').hidden = !!error;
    if (error) return;
    const factor = (1 + rate / 100) ** years;
    $('years-result').textContent = `${years} ${years === 1 ? 'Jahr' : 'Jahren'}`;
    $('future-price').textContent = currency.format(amount * factor);
    $('purchasing-power').textContent = currency.format(amount / factor);
    $('remaining').textContent = `${number.format(100 / factor)} % der ursprünglichen Kaufkraft bleiben.`;
    $('purchasing-bar').style.width = `${100 / factor}%`;
  }
  $('calculator').addEventListener('submit', calculate);
  calculate();
})();
