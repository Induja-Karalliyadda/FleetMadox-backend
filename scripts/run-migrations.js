import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import 'dotenv/config';


const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const pool = new Pool({ connectionString: process.env.DATABASE_URL });


async function run() {
const dir = path.join(__dirname, '..', 'migrations');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();


const client = await pool.connect();
try {
console.log('Running migrations...');
for (const file of files) {
const full = path.join(dir, file);
const sql = fs.readFileSync(full, 'utf8');
console.log(`\n>> ${file}`);
await client.query(sql);
console.log(' ok');
}
console.log('\nAll migrations applied.');
} finally {
client.release();
await pool.end();
}
}


run().catch(err => {
console.error(err);
process.exit(1);
});