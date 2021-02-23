import { Request } from 'express';
import { User } from 'src/users/user.interface';
 
interface RequestWithUser extends Request {
  user: User;
}
 
export default RequestWithUser;