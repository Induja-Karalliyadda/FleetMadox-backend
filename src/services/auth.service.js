import { findByEmail } from '../repositories/users.repository.js';
import { comparePassword } from '../utils/hash.js';
import { signJWT } from '../utils/jwt.js';


export async function login(email, password) {
const user = await findByEmail(email);
if (!user) throw Object.assign(new Error('User not found'), { status: 401 });
if (!user.is_active) throw Object.assign(new Error('User is inactive'), { status: 403 });


const ok = await comparePassword(password, user.password);
if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });


const token = signJWT({ id: user.id, role: user.role });
return { token, role: user.role, name: user.name };
}