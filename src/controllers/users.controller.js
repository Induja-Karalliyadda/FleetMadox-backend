import { createUser, getProfile, listUsers, updateUser } from '../services/users.service.js';


export async function createUserController(req, res, next) {
try {
const user = await createUser(req.body);
res.status(201).json(user);
} catch (e) { next(e); }
}


export async function listUsersController(req, res, next) {
try {
const users = await listUsers();
res.json(users);
} catch (e) { next(e); }
}


export async function getUserController(req, res, next) {
try {
const user = await getProfile(Number(req.params.id));
res.json(user);
} catch (e) { next(e); }
}


export async function updateUserController(req, res, next) {
try {
const user = await updateUser(Number(req.params.id), req.body);
res.json(user);
} catch (e) { next(e); }
}