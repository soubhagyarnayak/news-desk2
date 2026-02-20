import { startServer } from './server';

startServer().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
