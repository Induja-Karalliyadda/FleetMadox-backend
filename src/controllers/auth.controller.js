import { login } from '../services/auth.service.js';


export async function loginController(req, res, next) {
try {
const { email, password } = req.body;
const data = await login(email, password);
res.json(data);
} catch (e) { next(e); }
}


export async function meController(req, res) {
// req.user set by authenticate middleware
res.json({ id: req.user.id, role: req.user.role });
}