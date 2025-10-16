import { query } from '../config/db.js';

export async function listBuses() {
  const { rows } = await query('SELECT * FROM bus ORDER BY id', []);
  return rows;
}

export async function findBusById(id) {
  const { rows } = await query('SELECT * FROM bus WHERE id = $1', [id]);
  return rows[0];
}

export async function createBus(data) {
  const { no_plate, brand, model, number_of_seats, fuel_type, fuel_tank_capacity, wheel_count, engine_cc, year_of_manufacture, is_active = true } = data;
  const { rows } = await query(
    `INSERT INTO bus (no_plate, brand, model, number_of_seats, fuel_type, fuel_tank_capacity, wheel_count, engine_cc, year_of_manufacture, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [no_plate, brand, model, number_of_seats, fuel_type, fuel_tank_capacity, wheel_count, engine_cc, year_of_manufacture, is_active]
  );
  return rows[0];
}

export async function updateBus(id, patch) {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k} = $${idx++}`);
    values.push(v);
  }
  if (!fields.length) return findBusById(id);
  values.push(id);
  const { rows } = await query(
    `UPDATE bus SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0];
}


export async function deleteBus(id) {
  const { rowCount } = await query('DELETE FROM bus WHERE id = $1', [id]);
  return rowCount > 0;
}
