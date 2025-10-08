import { pool } from "../config/db.js";

// ✅ Get all staff except admin
export const getAllStaff = async () => {
  const result = await pool.query(`
    SELECT id, name, address, mobile, role, nic, employe_number AS employee_number,
           email, is_active
    FROM users
    WHERE LOWER(role) IN ('driver', 'accountant')
    ORDER BY id DESC
  `);
  return result.rows;
};

// ✅ Generate next employee number based on role
export const getNextEmployeeNumber = async (role) => {
  const normalizedRole = role.toLowerCase();
  const prefix = normalizedRole === "driver" ? "EMP-DRV-" : "EMP-ACC-";
  const result = await pool.query(
    "SELECT employe_number FROM users WHERE LOWER(role) = LOWER($1) ORDER BY id DESC LIMIT 1",
    [normalizedRole]
  );

  if (result.rows.length === 0) return `${prefix}001`;

  const lastNumber = result.rows[0].employe_number.split("-").pop();
  const next = String(parseInt(lastNumber) + 1).padStart(3, "0");
  return `${prefix}${next}`;
};

// ✅ Add new staff (lowercase role fix)
export const addStaff = async (staff) => {
  const result = await pool.query(
    `INSERT INTO users (name, address, mobile, role, nic, employe_number, email, password, is_active)
     VALUES ($1, $2, $3, LOWER($4), $5, $6, $7, $8, $9)
     RETURNING id, name, role, email, employe_number AS employee_number`,
    [
      staff.name,
      staff.address,
      staff.mobile,
      staff.role,
      staff.nic,
      staff.employee_number,
      staff.email,
      staff.password,
      staff.is_active,
    ]
  );
  return result.rows[0];
};

// ✅ Update staff (re-hash handled in service)
export const updateStaff = async (id, staff) => {
  const result = await pool.query(
    `UPDATE users 
     SET name=$1, address=$2, mobile=$3, nic=$4, email=$5,
         password=COALESCE($6,password), is_active=$7, update_at=NOW()
     WHERE id=$8
     RETURNING id, name, role, email, employe_number AS employee_number`,
    [
      staff.name,
      staff.address,
      staff.mobile,
      staff.nic,
      staff.email,
      staff.password || null,
      staff.is_active,
      id,
    ]
  );
  return result.rows[0];
};

// ✅ Delete staff
export const deleteStaff = async (id) => {
  await pool.query("DELETE FROM users WHERE id=$1", [id]);
};
