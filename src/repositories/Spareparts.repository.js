// src/repositories/Spareparts.repository.js
import { pool } from "../config/db.js";
// ==================== SPARE PART (Master) ====================

export const findAllSpareParts = async () => {
    const result = await pool.query(
        'SELECT * FROM spare_part ORDER BY part_name ASC'
    );
    return result.rows;
};

export const findSparePartById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM spare_part WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

export const findSparePartByName = async (partName) => {
    const result = await pool.query(
        'SELECT * FROM spare_part WHERE LOWER(part_name) = LOWER($1)',
        [partName]
    );
    return result.rows[0];
};

export const createSparePart = async (data) => {
    const { part_name, description } = data;
    const result = await pool.query(
        `INSERT INTO spare_part (part_name, description) 
         VALUES ($1, $2) 
         RETURNING *`,
        [part_name, description || null]
    );
    return result.rows[0];
};

export const updateSparePart = async (id, data) => {
    const { part_name, description } = data;
    const result = await pool.query(
        `UPDATE spare_part 
         SET part_name = COALESCE($1, part_name),
             description = COALESCE($2, description),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [part_name, description, id]
    );
    return result.rows[0];
};

export const deleteSparePart = async (id) => {
    const result = await pool.query(
        'DELETE FROM spare_part WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

// ==================== VEHICLE SPARE PART (Installations) ====================

export const findAllVehicleSpareParts = async (filters = {}) => {
    const { bus_id, is_active, spare_part_id } = filters;
    
    let query = `
        SELECT 
            vsp.*,
            sp.part_name,
            sp.description as part_description,
            b.no_plate,
            b.brand as bus_brand,
            b.model as bus_model,
            u.name as installer_name
        FROM vehicle_spare_part vsp
        JOIN spare_part sp ON vsp.spare_part_id = sp.id
        JOIN bus b ON vsp.bus_id = b.id
        LEFT JOIN users u ON vsp.installed_by = u.id
        WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (bus_id) {
        query += ` AND vsp.bus_id = $${paramIndex}`;
        params.push(bus_id);
        paramIndex++;
    }
    
    if (is_active !== undefined) {
        query += ` AND vsp.is_active = $${paramIndex}`;
        params.push(is_active);
        paramIndex++;
    }
    
    if (spare_part_id) {
        query += ` AND vsp.spare_part_id = $${paramIndex}`;
        params.push(spare_part_id);
        paramIndex++;
    }
    
    query += ' ORDER BY vsp.install_date DESC, vsp.created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
};

export const findVehicleSparePartById = async (id) => {
    const result = await pool.query(`
        SELECT 
            vsp.*,
            sp.part_name,
            sp.description as part_description,
            b.no_plate,
            b.brand as bus_brand,
            b.model as bus_model,
            u.name as installer_name
        FROM vehicle_spare_part vsp
        JOIN spare_part sp ON vsp.spare_part_id = sp.id
        JOIN bus b ON vsp.bus_id = b.id
        LEFT JOIN users u ON vsp.installed_by = u.id
        WHERE vsp.id = $1
    `, [id]);
    return result.rows[0];
};

export const createVehicleSparePart = async (data) => {
    const {
        spare_part_id,
        bus_id,
        install_odometer,
        install_date,
        installed_by,
        cost,
        distance_limit,
        brand,
        is_active = true,
        boundary_limit
    } = data;
    
    const result = await pool.query(`
        INSERT INTO vehicle_spare_part (
            spare_part_id, bus_id, install_odometer, install_date,
            installed_by, cost, distance_limit, brand, is_active, boundary_limit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `, [
        spare_part_id, bus_id, install_odometer, install_date,
        installed_by, cost, distance_limit, brand, is_active, boundary_limit
    ]);
    
    return result.rows[0];
};

export const updateVehicleSparePart = async (id, data) => {
    const { is_active, cost, brand, distance_limit, boundary_limit } = data;
    
    const result = await pool.query(`
        UPDATE vehicle_spare_part 
        SET is_active = COALESCE($1, is_active),
            cost = COALESCE($2, cost),
            brand = COALESCE($3, brand),
            distance_limit = COALESCE($4, distance_limit),
            boundary_limit = COALESCE($5, boundary_limit),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
    `, [is_active, cost, brand, distance_limit, boundary_limit, id]);
    
    return result.rows[0];
};

export const deleteVehicleSparePart = async (id) => {
    const result = await pool.query(
        'DELETE FROM vehicle_spare_part WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

// ==================== MAINTENANCE LOG ====================

export const createMaintenanceLog = async (data) => {
    const { vehicle_spare_part_id, bus_id, odometer_at_service, action_taken, performed_by } = data;
    
    const result = await pool.query(`
        INSERT INTO maintenance_log (vehicle_spare_part_id, bus_id, odometer_at_service, action_taken, performed_by)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `, [vehicle_spare_part_id, bus_id, odometer_at_service, action_taken, performed_by]);
    
    return result.rows[0];
};

export const findMaintenanceLogs = async (filters = {}) => {
    const { bus_id } = filters;
    
    let query = `
        SELECT 
            ml.*,
            b.no_plate,
            u.name as performed_by_name
        FROM maintenance_log ml
        JOIN bus b ON ml.bus_id = b.id
        LEFT JOIN users u ON ml.performed_by = u.id
        WHERE 1=1
    `;
    
    const params = [];
    if (bus_id) {
        query += ' AND ml.bus_id = $1';
        params.push(bus_id);
    }
    
    query += ' ORDER BY ml.created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
};

// ==================== ODOMETER READING ====================

export const findLatestOdometerByBus = async (busId) => {
    const result = await pool.query(`
        SELECT reading_km, reading_date, reading_type
        FROM odometer_reading 
        WHERE bus_id = $1 
        ORDER BY reading_date DESC, submitted_at DESC 
        LIMIT 1
    `, [busId]);
    
    return result.rows[0];
};

// ==================== REPLACEMENT ALERTS ====================

export const findPartsNeedingReplacement = async () => {
    const result = await pool.query(`
        SELECT 
            vsp.*,
            sp.part_name,
            b.no_plate,
            b.brand as bus_brand,
            b.model as bus_model,
            COALESCE(
                (SELECT MAX(reading_km) FROM odometer_reading WHERE bus_id = vsp.bus_id),
                vsp.install_odometer
            ) as current_odometer,
            COALESCE(
                (SELECT MAX(reading_km) FROM odometer_reading WHERE bus_id = vsp.bus_id),
                vsp.install_odometer
            ) - vsp.install_odometer as distance_used,
            vsp.distance_limit - (
                COALESCE(
                    (SELECT MAX(reading_km) FROM odometer_reading WHERE bus_id = vsp.bus_id),
                    vsp.install_odometer
                ) - vsp.install_odometer
            ) as distance_remaining
        FROM vehicle_spare_part vsp
        JOIN spare_part sp ON vsp.spare_part_id = sp.id
        JOIN bus b ON vsp.bus_id = b.id
        WHERE vsp.is_active = TRUE
        AND vsp.distance_limit - (
            COALESCE(
                (SELECT MAX(reading_km) FROM odometer_reading WHERE bus_id = vsp.bus_id),
                vsp.install_odometer
            ) - vsp.install_odometer
        ) <= vsp.boundary_limit
        ORDER BY distance_remaining ASC
    `);
    
    return result.rows;
};

export const findBusSparePartStatus = async (busId) => {
    const result = await pool.query(`
        SELECT 
            vsp.*,
            sp.part_name,
            sp.description as part_description,
            COALESCE(
                (SELECT MAX(reading_km) FROM odometer_reading WHERE bus_id = vsp.bus_id),
                vsp.install_odometer
            ) as current_odometer,
            COALESCE(
                (SELECT MAX(reading_km) FROM odometer_reading WHERE bus_id = vsp.bus_id),
                vsp.install_odometer
            ) - vsp.install_odometer as distance_used,
            vsp.distance_limit - (
                COALESCE(
                    (SELECT MAX(reading_km) FROM odometer_reading WHERE bus_id = vsp.bus_id),
                    vsp.install_odometer
                ) - vsp.install_odometer
            ) as distance_remaining,
            CASE 
                WHEN vsp.distance_limit - (
                    COALESCE(
                        (SELECT MAX(reading_km) FROM odometer_reading WHERE bus_id = vsp.bus_id),
                        vsp.install_odometer
                    ) - vsp.install_odometer
                ) <= 0 THEN 'CRITICAL'
                WHEN vsp.distance_limit - (
                    COALESCE(
                        (SELECT MAX(reading_km) FROM odometer_reading WHERE bus_id = vsp.bus_id),
                        vsp.install_odometer
                    ) - vsp.install_odometer
                ) <= vsp.boundary_limit THEN 'WARNING'
                ELSE 'OK'
            END as status
        FROM vehicle_spare_part vsp
        JOIN spare_part sp ON vsp.spare_part_id = sp.id
        WHERE vsp.bus_id = $1 AND vsp.is_active = TRUE
        ORDER BY distance_remaining ASC
    `, [busId]);
    
    return result.rows;
};