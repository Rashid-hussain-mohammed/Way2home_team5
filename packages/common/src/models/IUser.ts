import { Gender } from "./Gender"; 
import { Role } from "./Role"; 

export interface IUser {
  id: string; 
  firstName: string; 
  lastName: string; 
  email: string; 
  password: string; 
  gender: Gender; 
  birthDate: Date; 
  phone: string; 
  creationDate: Date; 
  avatar?: string;
  role: Role; 
  about?: string; 
}
