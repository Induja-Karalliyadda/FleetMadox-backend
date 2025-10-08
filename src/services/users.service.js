import { createUser as repoCreate, findById, listAll, updateUser as repoUpdate } from '../repositories/users.repository.js';
import { hashPassword } from '../utils/hash.js';


export async function createUser(dto) {
const toCreate = { ...dto };
toCreate.password = await hashPassword(dto.password);
return repoCreate(toCreate);
}


export async function getProfile(id) {
const user = await findById(id);
if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
const { password, ...safe } = user;
return safe;
}


export async function listUsers() { return listAll(); }


export async function updateUser(id, dto) {
const patch = { ...dto };
if (dto.password) patch.password = await hashPassword(dto.password);
return repoUpdate(id, patch);
}