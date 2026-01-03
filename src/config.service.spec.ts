import * as fs from 'fs';
import { Pool } from 'pg';
import { ConfigService } from './config.service';

jest.mock('fs');
jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation((options) => ({
      options,
    })),
  };
});

describe('ConfigService', () => {
  const mockedFs = fs as jest.Mocked<typeof fs>;
  const mockedPool = Pool as jest.MockedClass<typeof Pool>;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_HOST;
    delete process.env.DB_DATABASE;
    delete process.env.DB_PORT;
    delete process.env.DB_CERTIFICATE_PATH;
  });

  describe('get()', () => {
    it('reads values from env file when file exists', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(
        Buffer.from('FOO=bar')
      );

      const service = new ConfigService('.env.test');
      expect(service.get('FOO')).toBe('bar');
    });

    it('falls back to process.env when file does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);
      process.env.FOO = 'baz';

      const service = new ConfigService('.env.test');
      expect(service.get('FOO')).toBe('baz');
    });
  });

  describe('getPool()', () => {
    it('creates pool with base config', () => {
      mockedFs.existsSync.mockReturnValue(false);

      process.env.DB_USER = 'user';
      process.env.DB_PASSWORD = 'pass';
      process.env.DB_HOST = 'localhost';
      process.env.DB_DATABASE = 'testdb';

      const service = new ConfigService('.env.test');
      const pool = service.getPool();

      expect(mockedPool).toHaveBeenCalledWith({
        user: 'user',
        password: 'pass',
        host: 'localhost',
        database: 'testdb',
      });

      expect(pool.options.port).toBeUndefined();
      expect(pool.options.ssl).toBeUndefined();
    });

    it('sets port when DB_PORT is present', () => {
      mockedFs.existsSync.mockReturnValue(false);

      process.env.DB_USER = 'user';
      process.env.DB_PASSWORD = 'pass';
      process.env.DB_HOST = 'localhost';
      process.env.DB_DATABASE = 'testdb';
      process.env.DB_PORT = '5433';

      const service = new ConfigService('.env.test');
      const pool = service.getPool();

      expect(pool.options.port).toBe('5433');
    });

    it('sets SSL config when certificate path is present', () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.readFileSync.mockReturnValue(
        Buffer.from('CERT_DATA')
      );

      process.env.DB_USER = 'user';
      process.env.DB_PASSWORD = 'pass';
      process.env.DB_HOST = 'localhost';
      process.env.DB_DATABASE = 'testdb';
      process.env.DB_CERTIFICATE_PATH = '/cert.pem';

      const service = new ConfigService('.env.test');
      const pool = service.getPool();

      expect(mockedFs.readFileSync).toHaveBeenCalledWith('/cert.pem');
      expect(pool.options.ssl).toEqual({
        ca: 'CERT_DATA',
        rejectUnauthorized: true,
      });
    });
  });
});
