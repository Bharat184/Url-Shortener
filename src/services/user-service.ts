import { User } from "../models/user-model.js";
import { UserType } from "../models/user-model.js";


export const createUser = async (user: UserType) => {
  return await User.create(user);
};

export const getUser = async (email: string) => {
  return await User.findOne({email});
};
