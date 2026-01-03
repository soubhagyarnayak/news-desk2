import { UsersService } from './users.service';
import { ConfigService } from '../config.service';
import { Pool } from 'pg';

describe('UsersService', () => {
  let service: UsersService;
  let pool: Pool;
  let querySpy: jest.SpyInstance;

  beforeEach(async () => {
    pool = {
      query: jest.fn(),
    } as unknown as Pool;

    querySpy = jest.spyOn(pool, 'query');

    const configService = {
      getPool: jest.fn().mockReturnValue(pool),
    } as unknown as ConfigService;

    service = new UsersService(configService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns password when user exists', async () => {
    querySpy.mockResolvedValue({
      rows: [{ passwordhash: 'hashed123' }],
    });

    const result = await service.getPassword('alice');

    expect(querySpy).toHaveBeenCalledWith(
      'SELECT passwordhash FROM users WHERE username=$1',
      ['alice']
    );
    expect(result).toBe('hashed123');
  });

  it('returns undefined when user does not exist', async () => {
    querySpy.mockResolvedValue({ rows: [] });

    const result = await service.getPassword('bob');

    expect(result).toBeNull();
  });

  it('creates a user', async () => {
    querySpy.mockResolvedValue({});

    await service.create('charlie', 'hash456');

    expect(querySpy).toHaveBeenCalledWith(
      'INSERT INTO users (username, passwordhash) VALUES ($1,$2)',
      ['charlie', 'hash456']
    );
  });

});
