import { Request, Response } from "express";
import { createUser, getUser } from "../services/user-service";

export const addUser = async (req: Request, res: Response) => {
  try {
    const { password, email } = req.body;
    const user = await createUser({email, password});
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const fetchUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getUser('sample@gmail.com');
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
