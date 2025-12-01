import { query } from '../config/db.js';

// List with filters/pagination - NO default limit to get all records
export async function listAssignments({ vehicle_id, employee_id, active, limit, offset = 0 } = {}) {
  const where = [];
  const params = [];
  
  if (vehicle_id) { 
    params.push(vehicle_id); 
    where.push(`vehicle_id = $${params.length}`); 
  }
  if (employee_id) { 
    params.push(employee_id); 
    where.push(`employee_id = $${params.length}`); 
  }
  if (active === 'true') {
    where.push(`(start_date <= NOW() AND (end_date IS NULL OR end_date >= NOW()))`);
  }

  // Build SQL with optional limit
  let sql = `
    SELECT vehicle_driver_assignmentid AS id,
           vehicle_id,
           employee_id,
           start_date,
           end_date,
           route,
           created_at,
           update_at
    FROM vehicle_driver_assignment
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY start_date DESC
  `;

  // Only add LIMIT/OFFSET if limit is provided
  if (limit) {
    params.push(limit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;
    sql += ` LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
  }

  console.log('Executing SQL:', sql);
  console.log('With params:', params);

  const { rows } = await query(sql, params);
  console.log('Query returned rows:', rows.length);
  
  return rows;
}

export async function getAssignmentById(id) {
  const { rows } = await query(
    `SELECT vehicle_driver_assignmentid AS id,
            vehicle_id,
            employee_id,
            start_date,
            end_date,
            route,
            created_at,
            update_at
       FROM vehicle_driver_assignment
      WHERE vehicle_driver_assignmentid = $1`,
    [id]
  );
  return rows[0];
}

export async function createAssignment({ vehicle_id, employee_id, start_date, end_date, route }) {
  const { rows } = await query(
    `INSERT INTO vehicle_driver_assignment (vehicle_id, employee_id, start_date, end_date, route)
     VALUES ($1, $2, COALESCE($3, NOW()), $4, $5)
     RETURNING vehicle_driver_assignmentid AS id,
               vehicle_id,
               employee_id,
               start_date,
               end_date,
               route,
               created_at,
               update_at`,
    [vehicle_id, employee_id, start_date ?? null, end_date ?? null, route ?? null]
  );
  return rows[0];
}

export async function updateAssignmentById(id, patch) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [k, v] of Object.entries(patch)) {
    // whitelist fields we allow to change
    if (!['vehicle_id', 'employee_id', 'start_date', 'end_date', 'route'].includes(k)) continue;
    fields.push(`${k} = $${idx++}`);
    values.push(v);
  }
  if (!fields.length) return getAssignmentById(id);

  values.push(id);
  const { rows } = await query(
    `UPDATE vehicle_driver_assignment
        SET ${fields.join(', ')}, update_at = NOW()
      WHERE vehicle_driver_assignmentid = $${idx}
      RETURNING vehicle_driver_assignmentid AS id,
                vehicle_id,
                employee_id,
                start_date,
                end_date,
                route,
                created_at,
                update_at`,
    values
  );
  return rows[0];
}

export async function deleteAssignmentById(id) {
  await query(
    `DELETE FROM vehicle_driver_assignment
      WHERE vehicle_driver_assignmentid = $1`,
    [id]
  );
  return { ok: true };
}