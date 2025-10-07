import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';


const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


const users = [
{
name: 'Admin One', address: 'HQ', mobile: '0700000001', role: 'admin',
nic: '991234567V', employe_number: 'EMP-ADM-001', email: 'admin@fleetmadox.com', password: 'Admin@123', is_active: true
},
{
name: 'Accountant One', address: 'Finance Dept', mobile: '0700000002', role: 'accountant',
nic: '991234568V', employe_number: 'EMP-ACC-001', email: 'acc@fleetmadox.com', password: 'Acc@123', is_active: true
},
{
name: 'Driver One', address: 'Depot A', mobile: '0700000003', role: 'driver',
nic: '991234569V', employe_number: 'EMP-DRV-001', email: 'driver@fleetmadox.com', password: 'Drv@123', is_active: true
}
];


async function run() {
const client = await pool.connect();
try {
for (const u of users) {
const hash = await bcrypt.hash(u.password, 10);
await client.query(
`INSERT INTO users (name, address, mobile, role, nic, employe_number, email, password, is_active)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
ON CONFLICT (email) DO NOTHING`,
[u.name, u.address, u.mobile, u.role, u.nic, u.employe_number, u.email, hash, u.is_active]
);
}
console.log('Seed done.');
} catch (e) {
console.error(e);
} finally {
client.release();
await pool.end();
}
}


run();