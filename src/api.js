const API_KEY =
  "900372c08a95ed49b877cd9ee613b646d3fee3954ad64ab2816ff1bdc0347be0";

const tickersHandlers = new Map();

const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys()
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then(r => r.json())
    .then(rawData => {
      const updatePrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatePrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach(fn => fn(newPrice));
      });
    });
};

export const subscribeToTicker = (ticker, cb) => {
  if (!tickersHandlers.has(ticker)) {
    tickersHandlers.set(ticker, []);
  }
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker);
};

setInterval(loadTickers, 5000);
window.tickersHandlers = tickersHandlers;
