
export default () => ({
  exchange: {
    url: process.env.EXCHANGE_RATE_URL,
    secret: process.env.EXCHANGE_RATE_SECRET,
  }
});
