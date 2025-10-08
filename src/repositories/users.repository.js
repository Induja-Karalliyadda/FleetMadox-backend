import { query } from '../config/db.js';


export async function findByEmail(email) {
const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
return rows[0];
}


export async function findById(id) {
const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
return rows[0];
}


export async function listAll() {
const { rows } = await query('SELECT id, name, email, role, is_active, created_at, update_at FROM users ORDER BY id', []);
return rows;
}


export async function createUser(data) {
const { name, address, mobile, role, nic, employe_number, email, password, is_active = true } = data;
const { rows } = await query(
`INSERT INTO users (name, address, mobile, role, nic, employe_number, email, password, is_active)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
RETURNING id, name, email, role, is_active, created_at, update_at`,
[name, address, mobile, role, nic, employe_number, email, password, is_active]
);
return rows[0];
}


export async function updateUser(id, patch) {
const fields = [];
const values = [];
let idx = 1;
for (const [k, v] of Object.entries(patch)) {
fields.push(`${k} = $${idx++}`);
values.push(v);
}
if (!fields.length) return findById(id);
values.push(id);
const { rows } = await query(
`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, is_active, created_at, update_at`,
values
);
return rows[0];
}