import { Injectable } from '@nestjs/common'
import { Pool } from 'pg'
import { ConfigService } from '../config.service'
import { User } from './user.interface'

@Injectable()
export class UsersService {

  private user: string
  private password: string
  private host: string
  private database: string
  private pool: Pool
  
  constructor(config: ConfigService) {
      this.user = config.get('DB_USER')
      this.password = config.get('DB_PASSWORD')
      this.host = config.get('DB_HOST')
      this.database = config.get('DB_DATABASE')
      this.pool = this.getPool()
  }

  async getPassword(username: string): Promise<string | undefined> {
    let query = 'SELECT passwordhash FROM users WHERE username=$1'
    let args = [username]
    let result = await this.pool.query(query, args)
    var password = null
    if(result.rows.length>0){
      let row = result.rows[0]
      password = row.passwordhash
    }
    return password
  }

  async create(username: string, hashedPassword: string):Promise<void> {
    let query = 'INSERT INTO users (username, passwordhash) VALUES ($1,$2)'
    let args = [username, hashedPassword]
    await this.pool.query(query,args)
  }

  private getPool():Pool {
    return new Pool( {
        user: this.user,
        password: this.password,
        host: this.host,
        database: this.database,
    });
}

}

