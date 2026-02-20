import express = require('express');
import { join } from 'path';
import { config } from 'dotenv';
import morgan = require('morgan');
import * as cookieParser from 'cookie-parser';
import appRoutes from './routes/app.routes';
import hnRoutes from './routes/hn.routes';
import authRoutes from './routes/auth.routes';
import opedRoutes from './routes/oped.routes';
import settingsRoutes from './routes/settings.routes';
import passport = require('passport');
import configurePassport from './auth/passport';

export async function startServer(portArg?: string | number) {
  config({ path: join(__dirname, '..', '.env') });
  const port = Number(portArg || process.env.PORT || 3000);
  const app = express();

  app.use(morgan('dev'));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // configure passport strategies and initialize
  configurePassport();
  app.use(passport.initialize());
  app.use(express.static(join(__dirname, '..', 'public')));
  app.use(express.static(join(__dirname, '..', 'node_modules', 'bootstrap', 'dist')));
  app.set('views', join(__dirname, '..', 'views'));
  app.set('view engine', 'ejs');

  // Mount migrated routes
  app.use('/', appRoutes);
  app.use('/hn', hnRoutes);
  app.use('/authentication', authRoutes);
  app.use('/oped', opedRoutes);
  app.use('/settings', settingsRoutes);

  return new Promise<void>((resolve, reject) => {
    const server = app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Express server listening on port ${port}`);
      resolve();
    });
    server.on('error', reject);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
