// Bus Fitness Repository
// File: repositories/Busfitnessrepository.js

import { query } from '../config/db.js';

// ==========================================
// FIND ALL FITNESS RECORDS
// ==========================================
export const findAll = async ({ limit = 20, offset = 0, sortBy = 'check_date', order = 'DESC' }) => {
  const validSortColumns = ['id', 'check_date', 'submitted_at', 'bus_id', 'driver_id'];
  const validOrders = ['ASC', 'DESC'];
  
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'check_date';
  const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
  
  const queryText = `
    SELECT 
      bf.*,
      u.name as driver_name,
      b.no_plate as bus_plate,
      b.brand as bus_brand,
      b.model as bus_model
    FROM bus_fitness bf
    LEFT JOIN users u ON bf.driver_id = u.id
    LEFT JOIN bus b ON bf.bus_id = b.id
    ORDER BY bf.${sortColumn} ${sortOrder}
    LIMIT $1 OFFSET $2
  `;
  
  const result = await query(queryText, [limit, offset]);
  return result.rows;
};

// ==========================================
// COUNT ALL RECORDS
// ==========================================
export const count = async () => {
  const queryText = 'SELECT COUNT(*) as total FROM bus_fitness';
  const result = await query(queryText);
  return parseInt(result.rows[0].total);
};

// ==========================================
// FIND BY ID
// ==========================================
export const findById = async (id) => {
  const queryText = `
    SELECT 
      bf.*,
      u.name as driver_name,
      b.no_plate as bus_plate,
      b.brand as bus_brand,
      b.model as bus_model
    FROM bus_fitness bf
    LEFT JOIN users u ON bf.driver_id = u.id
    LEFT JOIN bus b ON bf.bus_id = b.id
    WHERE bf.id = $1
  `;
  
  const result = await query(queryText, [id]);
  return result.rows[0] || null;
};

// ==========================================
// FIND BY DATE
// ==========================================
export const findByDate = async (date) => {
  const queryText = `
    SELECT 
      bf.*,
      u.name as driver_name,
      b.no_plate as bus_plate,
      b.brand as bus_brand,
      b.model as bus_model
    FROM bus_fitness bf
    LEFT JOIN users u ON bf.driver_id = u.id
    LEFT JOIN bus b ON bf.bus_id = b.id
    WHERE bf.check_date = $1
    ORDER BY bf.submitted_at DESC
  `;
  
  const result = await query(queryText, [date]);
  return result.rows;
};

// ==========================================
// FIND BY BUS ID
// ==========================================
export const findByBusId = async (busId, { startDate, endDate } = {}) => {
  let queryText = `
    SELECT 
      bf.*,
      u.name as driver_name,
      b.no_plate as bus_plate,
      b.brand as bus_brand,
      b.model as bus_model
    FROM bus_fitness bf
    LEFT JOIN users u ON bf.driver_id = u.id
    LEFT JOIN bus b ON bf.bus_id = b.id
    WHERE bf.bus_id = $1
  `;
  
  const params = [busId];
  let paramIndex = 2;
  
  if (startDate) {
    queryText += ` AND bf.check_date >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }
  
  if (endDate) {
    queryText += ` AND bf.check_date <= $${paramIndex}`;
    params.push(endDate);
  }
  
  queryText += ' ORDER BY bf.check_date DESC, bf.submitted_at DESC';
  
  const result = await query(queryText, params);
  return result.rows;
};

// ==========================================
// GET BUS HISTORY WITH DRIVER DETAILS
// ==========================================
export const getBusHistoryWithDriverDetails = async (busId, limit = 50) => {
  const queryText = `
    SELECT 
      bf.id,
      bf.assignment_id,
      bf.driver_id,
      bf.bus_id,
      bf.oil_level,
      bf.oil_checked,
      bf.water_level,
      bf.water_checked,
      bf.notes,
      bf.check_date,
      bf.submitted_at,
      bf.created_at,
      u.name as driver_name,
      u.mobile as driver_mobile,
      u.employe_number as driver_employee_number,
      b.no_plate as bus_plate,
      b.brand as bus_brand,
      b.model as bus_model,
      vda.route as assignment_route,
      vda.start_date as assignment_start,
      vda.end_date as assignment_end
    FROM bus_fitness bf
    LEFT JOIN users u ON bf.driver_id = u.id
    LEFT JOIN bus b ON bf.bus_id = b.id
    LEFT JOIN vehicle_driver_assignment vda ON bf.assignment_id = vda.vehicle_driver_assignmentid
    WHERE bf.bus_id = $1
    ORDER BY bf.check_date DESC, bf.submitted_at DESC
    LIMIT $2
  `;
  
  const result = await query(queryText, [busId, limit]);
  return result.rows;
};

// ==========================================
// GET BUS CHECK STATUS BY DATE
// ==========================================
export const getBusCheckStatusByDate = async (date) => {
  const queryText = `
    SELECT 
      b.id as bus_id,
      b.no_plate,
      b.brand,
      b.model,
      b.is_active,
      COALESCE(checks.oil_checked, false) as oil_checked,
      COALESCE(checks.water_checked, false) as water_checked,
      checks.oil_level,
      checks.water_level,
      checks.driver_name,
      checks.submitted_at
    FROM bus b
    LEFT JOIN (
      SELECT DISTINCT ON (bf.bus_id)
        bf.bus_id,
        bf.oil_checked,
        bf.water_checked,
        bf.oil_level,
        bf.water_level,
        bf.submitted_at,
        u.name as driver_name
      FROM bus_fitness bf
      LEFT JOIN users u ON bf.driver_id = u.id
      WHERE bf.check_date = $1
      ORDER BY bf.bus_id, bf.submitted_at DESC
    ) checks ON b.id = checks.bus_id
    WHERE b.is_active = true
    ORDER BY b.no_plate
  `;
  
  const result = await query(queryText, [date]);
  return result.rows;
};

// ==========================================
// GET ASSIGNMENTS WITH CHECK STATUS
// ==========================================
export const getAssignmentsWithCheckStatus = async (date) => {
  const queryText = `
    SELECT 
      vda.vehicle_driver_assignmentid as id,
      vda.vehicle_id as bus_id,
      vda.employee_id as driver_id,
      vda.route,
      vda.start_date,
      vda.end_date,
      u.name as driver_name,
      u.mobile as driver_mobile,
      b.no_plate as bus_plate,
      b.brand as bus_brand,
      b.model as bus_model,
      bf.id as fitness_id,
      bf.oil_level,
      bf.oil_checked,
      bf.water_level,
      bf.water_checked,
      bf.notes as fitness_notes,
      bf.submitted_at as check_submitted_at,
      CASE WHEN bf.id IS NOT NULL THEN true ELSE false END as has_checked
    FROM vehicle_driver_assignment vda
    LEFT JOIN users u ON vda.employee_id = u.id
    LEFT JOIN bus b ON vda.vehicle_id = b.id
    LEFT JOIN bus_fitness bf ON (
      vda.vehicle_driver_assignmentid = bf.assignment_id 
      AND bf.check_date = $1
    )
    WHERE $1::date >= DATE(vda.start_date) 
      AND $1::date <= DATE(vda.end_date)
      AND vda.period != 'empty'
    ORDER BY vda.start_date DESC
  `;
  
  const result = await query(queryText, [date]);
  return result.rows;
};

// ==========================================
// FIND BY ASSIGNMENT AND DATE
// ==========================================
export const findByAssignmentAndDate = async (assignmentId, date) => {
  const queryText = `
    SELECT * FROM bus_fitness 
    WHERE assignment_id = $1 AND check_date = $2
  `;
  
  const result = await query(queryText, [assignmentId, date]);
  return result.rows[0] || null;
};

// ==========================================
// CREATE FITNESS RECORD
// ==========================================
export const create = async (data) => {
  const {
    assignment_id,
    driver_id,
    bus_id,
    oil_level,
    oil_checked,
    water_level,
    water_checked,
    notes,
    check_date
  } = data;
  
  const queryText = `
    INSERT INTO bus_fitness (
      assignment_id,
      driver_id,
      bus_id,
      oil_level,
      oil_checked,
      water_level,
      water_checked,
      notes,
      check_date,
      submitted_at,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
    RETURNING *
  `;
  
  const result = await query(queryText, [
    assignment_id,
    driver_id,
    bus_id,
    oil_level,
    oil_checked,
    water_level,
    water_checked,
    notes || '',
    check_date
  ]);
  
  return result.rows[0];
};

// ==========================================
// UPDATE FITNESS RECORD
// ==========================================
export const update = async (id, data) => {
  const allowedFields = [
    'oil_level',
    'oil_checked',
    'water_level',
    'water_checked',
    'notes'
  ];
  
  const updates = [];
  const values = [];
  let paramIndex = 1;
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      values.push(data[field]);
      paramIndex++;
    }
  }
  
  if (updates.length === 0) {
    return findById(id);
  }
  
  updates.push(`updated_at = NOW()`);
  values.push(id);
  
  const queryText = `
    UPDATE bus_fitness 
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;
  
  const result = await query(queryText, values);
  return result.rows[0];
};

// ==========================================
// DELETE FITNESS RECORD
// ==========================================
export const deleteRecord = async (id) => {
  const queryText = 'DELETE FROM bus_fitness WHERE id = $1 RETURNING *';
  const result = await query(queryText, [id]);
  return result.rows[0];
};

// ==========================================
// GET SUMMARY STATISTICS
// ==========================================
export const getSummaryStats = async ({ startDate, endDate } = {}) => {
  let dateFilter = '';
  const params = [];
  
  if (startDate && endDate) {
    dateFilter = 'WHERE check_date BETWEEN $1 AND $2';
    params.push(startDate, endDate);
  } else if (startDate) {
    dateFilter = 'WHERE check_date >= $1';
    params.push(startDate);
  } else if (endDate) {
    dateFilter = 'WHERE check_date <= $1';
    params.push(endDate);
  }
  
  const queryText = `
    SELECT 
      COUNT(*) as total_checks,
      COUNT(CASE WHEN oil_checked = true THEN 1 END) as oil_checks_done,
      COUNT(CASE WHEN water_checked = true THEN 1 END) as water_checks_done,
      COUNT(CASE WHEN oil_level = 'full' THEN 1 END) as oil_full_count,
      COUNT(CASE WHEN oil_level = 'adequate' THEN 1 END) as oil_adequate_count,
      COUNT(CASE WHEN oil_level = 'low' THEN 1 END) as oil_low_count,
      COUNT(CASE WHEN water_level = 'full' THEN 1 END) as water_full_count,
      COUNT(CASE WHEN water_level = 'adequate' THEN 1 END) as water_adequate_count,
      COUNT(CASE WHEN water_level = 'low' THEN 1 END) as water_low_count,
      COUNT(DISTINCT bus_id) as buses_checked,
      COUNT(DISTINCT driver_id) as drivers_active,
      COUNT(DISTINCT check_date) as days_with_checks
    FROM bus_fitness
    ${dateFilter}
  `;
  
  const result = await query(queryText, params);
  return result.rows[0];
};

// ==========================================
// GET DAILY CHECK SUMMARY BY BUS
// ==========================================
export const getDailyCheckSummaryByBus = async (date) => {
  const queryText = `
    SELECT 
      b.id as bus_id,
      b.no_plate,
      b.brand,
      b.model,
      COUNT(bf.id) as check_count,
      bool_or(bf.oil_checked) as any_oil_check,
      bool_or(bf.water_checked) as any_water_check,
      MIN(bf.oil_level) as min_oil_level,
      MIN(bf.water_level) as min_water_level,
      array_agg(DISTINCT u.name) as drivers_checked
    FROM bus b
    LEFT JOIN bus_fitness bf ON b.id = bf.bus_id AND bf.check_date = $1
    LEFT JOIN users u ON bf.driver_id = u.id
    WHERE b.is_active = true
    GROUP BY b.id, b.no_plate, b.brand, b.model
    ORDER BY b.no_plate
  `;
  
  const result = await query(queryText, [date]);
  return result.rows;
};