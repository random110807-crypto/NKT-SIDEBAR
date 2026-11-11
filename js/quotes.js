// Ten-day rotation: one quotation remains for ten full days, then advances.
// Short quotations from public-domain authors / historical sources.
const QUOTES = [
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "We know what we are, but know not what we may be.", author: "William Shakespeare" },
  { text: "Experience is simply the name we give our mistakes.", author: "Oscar Wilde" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "It is not enough to be busy; so are the ants.", author: "Henry David Thoreau" },
  { text: "There is no charm equal to tenderness of heart.", author: "Jane Austen" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott" },
  { text: "Have nothing in your houses that you do not know to be useful.", author: "William Morris" },
  { text: "It's a poor sort of memory that only works backwards.", author: "Lewis Carroll" },
  { text: "One must still have chaos in oneself to give birth to a dancing star.", author: "Friedrich Nietzsche" }
];

export function renderDailyQuote() {
  const index = Math.floor(Date.now() / 86400000 / 10) % QUOTES.length;
  const quote = QUOTES[index];
  const text = document.getElementById('daily-quote');
  const credit = document.getElementById('quote-credit');
  if (text) text.textContent = `“${quote.text}”`;
  if (credit) credit.textContent = `— ${quote.author}`;
}
