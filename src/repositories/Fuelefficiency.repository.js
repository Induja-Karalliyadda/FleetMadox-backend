/**
 * Fuel Efficiency Repository
 * Database queries for fuel efficiency data
 * Uses: fuel_entries, odometer_reading, bus, users tables
 * File: repositories/Fuelefficiency.repository.js
 */

import { query } from '../config/db.js';

// ==========================================
// HELPER: Get Date Range Filter
// ==========================================
const getDateRangeFilter = (range) => {
  const now = new Date();
  let startDate;
  
  switch (range) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      return null;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return startDate.toISOString().split('T')[0];
};

// ==========================================
// BUS EFFICIENCY QUERIES
// ==========================================

/**
 * Get all buses with their fuel efficiency data
 */
export const findAllBusesEfficiency = async (range = 'month') => {
  const startDate = getDateRangeFilter(range);
  const params = [];
  let dateCondition = '';
  let odoDateCondition = '';
  
  if (startDate) {
    dateCondition = 'AND fe.fuel_date >= $1';
    odoDateCondition = 'AND reading_date >= $1';
    params.push(startDate);
  }
  
  const queryText = `
    WITH bus_odometer AS (
      SELECT 
        bus_id,
        MAX(reading_km) - MIN(reading_km) as total_distance
      FROM odometer_reading
      ${startDate ? 'WHERE reading_date >= $1' : ''}
      GROUP BY bus_id
    ),
    bus_fuel AS (
      SELECT 
        fe.bus_id,
        COUNT(fe.id) as trips,
        COALESCE(SUM(fe.liters_filled), 0) as total_fuel,
        COALESCE(SUM(fe.total_cost), 0) as total_cost
      FROM fuel_entries fe
      WHERE 1=1 ${dateCondition}
      GROUP BY fe.bus_id
    )
    SELECT 
      b.id as "busId",
      b.no_plate as "regNumber",
      COALESCE(b.brand || ' ' || b.model, b.brand, b.model, 'N/A') as model,
      b.brand,
      b.year_of_manufacture as year,
      b.is_active as "isActive",
      COALESCE(bo.total_distance, 0) as "totalKm",
      COALESCE(bf.total_fuel, 0) as "totalFuel",
      COALESCE(bf.total_cost, 0) as "totalCost",
      COALESCE(bf.trips, 0) as trips,
      CASE 
        WHEN COALESCE(bf.total_fuel, 0) > 0 AND COALESCE(bo.total_distance, 0) > 0
        THEN ROUND((bo.total_distance::numeric / bf.total_fuel), 2)
        ELSE 0 
      END as "avgKmPerLiter"
    FROM bus b
    LEFT JOIN bus_odometer bo ON b.id = bo.bus_id
    LEFT JOIN bus_fuel bf ON b.id = bf.bus_id
    WHERE b.is_active = true
    ORDER BY "avgKmPerLiter" DESC NULLS LAST
  `;
  
  const result = await query(queryText, params);
  return result.rows;
};

/**
 * Get single bus efficiency by ID
 */
export const findBusEfficiencyById = async (busId, range = 'month') => {
  const startDate = getDateRangeFilter(range);
  const params = [busId];
  let dateCondition = '';
  let odoDateCondition = '';
  
  if (startDate) {
    dateCondition = 'AND fe.fuel_date >= $2';
    odoDateCondition = 'AND reading_date >= $2';
    params.push(startDate);
  }
  
  const queryText = `
    WITH bus_odometer AS (
      SELECT 
        bus_id,
        MAX(reading_km) - MIN(reading_km) as total_distance
      FROM odometer_reading
      WHERE bus_id = $1 ${odoDateCondition}
      GROUP BY bus_id
    ),
    bus_fuel AS (
      SELECT 
        fe.bus_id,
        COUNT(fe.id) as trips,
        COALESCE(SUM(fe.liters_filled), 0) as total_fuel,
        COALESCE(SUM(fe.total_cost), 0) as total_cost
      FROM fuel_entries fe
      WHERE fe.bus_id = $1 ${dateCondition}
      GROUP BY fe.bus_id
    )
    SELECT 
      b.id as "busId",
      b.no_plate as "regNumber",
      COALESCE(b.brand || ' ' || b.model, b.brand, b.model, 'N/A') as model,
      b.brand,
      b.year_of_manufacture as year,
      b.is_active as "isActive",
      COALESCE(bo.total_distance, 0) as "totalKm",
      COALESCE(bf.total_fuel, 0) as "totalFuel",
      COALESCE(bf.total_cost, 0) as "totalCost",
      COALESCE(bf.trips, 0) as trips,
      CASE 
        WHEN COALESCE(bf.total_fuel, 0) > 0 AND COALESCE(bo.total_distance, 0) > 0
        THEN ROUND((bo.total_distance::numeric / bf.total_fuel), 2)
        ELSE 0 
      END as "avgKmPerLiter"
    FROM bus b
    LEFT JOIN bus_odometer bo ON b.id = bo.bus_id
    LEFT JOIN bus_fuel bf ON b.id = bf.bus_id
    WHERE b.id = $1
  `;
  
  const result = await query(queryText, params);
  return result.rows[0] || null;
};

/**
 * Get drivers who operated a specific bus (from fuel_entries)
 */
export const findDriversByBusId = async (busId, range = 'month') => {
  const startDate = getDateRangeFilter(range);
  const params = [busId];
  let dateCondition = '';
  let odoDateCondition = '';
  
  if (startDate) {
    dateCondition = 'AND fe.fuel_date >= $2';
    odoDateCondition = 'AND odr.reading_date >= $2';
    params.push(startDate);
  }
  
  const queryText = `
    WITH driver_odo AS (
      SELECT 
        odr.driver_id,
        MAX(odr.reading_km) - MIN(odr.reading_km) as km_driven
      FROM odometer_reading odr
      WHERE odr.bus_id = $1 ${odoDateCondition}
      GROUP BY odr.driver_id
    ),
    driver_fuel AS (
      SELECT 
        fe.driver_id,
        COUNT(fe.id) as trips,
        COALESCE(SUM(fe.liters_filled), 0) as fuel_used,
        COALESCE(SUM(fe.total_cost), 0) as fuel_cost
      FROM fuel_entries fe
      WHERE fe.bus_id = $1 ${dateCondition}
      GROUP BY fe.driver_id
    )
    SELECT 
      u.id as "driverId",
      u.name,
      u.employe_number as "employeeNo",
      u.mobile as phone,
      u.nic,
      COALESCE(doo.km_driven, 0) as "kmDriven",
      COALESCE(df.fuel_used, 0) as "fuelUsed",
      COALESCE(df.fuel_cost, 0) as "fuelCost",
      COALESCE(df.trips, 0) as trips,
      CASE 
        WHEN COALESCE(df.fuel_used, 0) > 0 AND COALESCE(doo.km_driven, 0) > 0
        THEN ROUND((doo.km_driven::numeric / df.fuel_used), 2)
        ELSE 0 
      END as "avgEfficiency"
    FROM users u
    INNER JOIN driver_fuel df ON u.id = df.driver_id
    LEFT JOIN driver_odo doo ON u.id = doo.driver_id
    WHERE u.role = 'driver'
    ORDER BY "kmDriven" DESC
  `;
  
  const result = await query(queryText, params);
  return result.rows;
};

/**
 * Get all fuel entries for a specific bus with driver info
 */
export const findFuelEntriesByBusId = async (busId, range = 'month') => {
  const startDate = getDateRangeFilter(range);
  const params = [busId];
  let dateCondition = '';
  
  if (startDate) {
    dateCondition = 'AND fe.fuel_date >= $2';
    params.push(startDate);
  }
  
  const queryText = `
    SELECT 
      fe.id,
      fe.fuel_date as date,
      u.id as "driverId",
      u.name as "driverName",
      u.employe_number as "driverEmployeeNo",
      fe.odometer_at_fueling as "odometerAtFueling",
      (
        SELECT reading_km 
        FROM odometer_reading 
        WHERE assignment_id = fe.assignment_id 
        AND reading_date = fe.fuel_date
        AND reading_type = 'morning'
        LIMIT 1
      ) as "startOdometer",
      (
        SELECT reading_km 
        FROM odometer_reading 
        WHERE assignment_id = fe.assignment_id 
        AND reading_date = fe.fuel_date
        AND reading_type = 'evening'
        LIMIT 1
      ) as "endOdometer",
      fe.liters_filled as "fuelLiters",
      fe.total_cost as "fuelCost",
      fe.price_per_liter as "pricePerLiter",
      fe.fuel_station as station,
      fe.notes,
      fe.created_at as "createdAt"
    FROM fuel_entries fe
    LEFT JOIN users u ON fe.driver_id = u.id
    WHERE fe.bus_id = $1 ${dateCondition}
    ORDER BY fe.fuel_date DESC, fe.created_at DESC
  `;
  
  const result = await query(queryText, params);
  
  return result.rows.map(entry => {
    const startOdo = parseFloat(entry.startOdometer) || 0;
    const endOdo = parseFloat(entry.endOdometer) || parseFloat(entry.odometerAtFueling) || 0;
    const kmTraveled = endOdo > startOdo ? endOdo - startOdo : 0;
    const fuelLiters = parseFloat(entry.fuelLiters) || 0;
    const efficiency = fuelLiters > 0 && kmTraveled > 0 ? (kmTraveled / fuelLiters) : 0;
    
    return {
      ...entry,
      startOdometer: startOdo,
      endOdometer: endOdo,
      kmTraveled,
      efficiency: Math.round(efficiency * 100) / 100
    };
  });
};

// ==========================================
// DRIVER EFFICIENCY QUERIES
// ==========================================

/**
 * Get all drivers with their fuel efficiency data
 */
export const findAllDriversEfficiency = async (range = 'month') => {
  const startDate = getDateRangeFilter(range);
  const params = [];
  let dateCondition = '';
  let odoDateCondition = '';
  
  if (startDate) {
    dateCondition = 'AND fe.fuel_date >= $1';
    odoDateCondition = 'AND reading_date >= $1';
    params.push(startDate);
  }
  
  const queryText = `
    WITH driver_odometer AS (
      SELECT 
        driver_id,
        MAX(reading_km) - MIN(reading_km) as total_distance,
        COUNT(DISTINCT bus_id) as bus_count
      FROM odometer_reading
      ${startDate ? 'WHERE reading_date >= $1' : ''}
      GROUP BY driver_id
    ),
    driver_fuel AS (
      SELECT 
        fe.driver_id,
        COUNT(fe.id) as trips,
        COALESCE(SUM(fe.liters_filled), 0) as total_fuel,
        COALESCE(SUM(fe.total_cost), 0) as total_cost,
        COUNT(DISTINCT fe.bus_id) as bus_count
      FROM fuel_entries fe
      WHERE 1=1 ${dateCondition}
      GROUP BY fe.driver_id
    )
    SELECT 
      u.id as "driverId",
      u.name,
      u.nic,
      u.mobile as phone,
      u.employe_number as "licenseNo",
      u.created_at as "joinDate",
      COALESCE(doo.total_distance, 0) as "totalKm",
      COALESCE(df.total_fuel, 0) as "totalFuel",
      COALESCE(df.total_cost, 0) as "totalCost",
      COALESCE(df.trips, 0) as trips,
      COALESCE(df.bus_count, doo.bus_count, 0) as "busCount",
      CASE 
        WHEN COALESCE(df.total_fuel, 0) > 0 AND COALESCE(doo.total_distance, 0) > 0
        THEN ROUND((doo.total_distance::numeric / df.total_fuel), 2)
        ELSE 0 
      END as "avgKmPerLiter"
    FROM users u
    LEFT JOIN driver_odometer doo ON u.id = doo.driver_id
    LEFT JOIN driver_fuel df ON u.id = df.driver_id
    WHERE u.role = 'driver'
    ORDER BY "avgKmPerLiter" DESC NULLS LAST
  `;
  
  const result = await query(queryText, params);
  return result.rows;
};

/**
 * Get single driver efficiency by ID
 */
export const findDriverEfficiencyById = async (driverId, range = 'month') => {
  const startDate = getDateRangeFilter(range);
  const params = [driverId];
  let dateCondition = '';
  let odoDateCondition = '';
  
  if (startDate) {
    dateCondition = 'AND fe.fuel_date >= $2';
    odoDateCondition = 'AND reading_date >= $2';
    params.push(startDate);
  }
  
  const queryText = `
    WITH driver_odometer AS (
      SELECT 
        driver_id,
        MAX(reading_km) - MIN(reading_km) as total_distance,
        COUNT(DISTINCT bus_id) as bus_count
      FROM odometer_reading
      WHERE driver_id = $1 ${odoDateCondition}
      GROUP BY driver_id
    ),
    driver_fuel AS (
      SELECT 
        fe.driver_id,
        COUNT(fe.id) as trips,
        COALESCE(SUM(fe.liters_filled), 0) as total_fuel,
        COALESCE(SUM(fe.total_cost), 0) as total_cost,
        COUNT(DISTINCT fe.bus_id) as bus_count
      FROM fuel_entries fe
      WHERE fe.driver_id = $1 ${dateCondition}
      GROUP BY fe.driver_id
    )
    SELECT 
      u.id as "driverId",
      u.name,
      u.nic,
      u.mobile as phone,
      u.employe_number as "licenseNo",
      u.created_at as "joinDate",
      COALESCE(doo.total_distance, 0) as "totalKm",
      COALESCE(df.total_fuel, 0) as "totalFuel",
      COALESCE(df.total_cost, 0) as "totalCost",
      COALESCE(df.trips, 0) as trips,
      COALESCE(df.bus_count, doo.bus_count, 0) as "busCount",
      CASE 
        WHEN COALESCE(df.total_fuel, 0) > 0 AND COALESCE(doo.total_distance, 0) > 0
        THEN ROUND((doo.total_distance::numeric / df.total_fuel), 2)
        ELSE 0 
      END as "avgKmPerLiter"
    FROM users u
    LEFT JOIN driver_odometer doo ON u.id = doo.driver_id
    LEFT JOIN driver_fuel df ON u.id = df.driver_id
    WHERE u.id = $1
  `;
  
  const result = await query(queryText, params);
  return result.rows[0] || null;
};

/**
 * Get buses operated by a specific driver
 */
export const findBusesByDriverId = async (driverId, range = 'month') => {
  const startDate = getDateRangeFilter(range);
  const params = [driverId];
  let dateCondition = '';
  let odoDateCondition = '';
  
  if (startDate) {
    dateCondition = 'AND fe.fuel_date >= $2';
    odoDateCondition = 'AND odr.reading_date >= $2';
    params.push(startDate);
  }
  
  const queryText = `
    WITH bus_odo AS (
      SELECT 
        odr.bus_id,
        MAX(odr.reading_km) - MIN(odr.reading_km) as km_driven
      FROM odometer_reading odr
      WHERE odr.driver_id = $1 ${odoDateCondition}
      GROUP BY odr.bus_id
    ),
    bus_fuel AS (
      SELECT 
        fe.bus_id,
        COUNT(fe.id) as trips,
        COALESCE(SUM(fe.liters_filled), 0) as fuel_used,
        COALESCE(SUM(fe.total_cost), 0) as fuel_cost
      FROM fuel_entries fe
      WHERE fe.driver_id = $1 ${dateCondition}
      GROUP BY fe.bus_id
    )
    SELECT 
      b.id as "busId",
      b.no_plate as "regNumber",
      COALESCE(b.brand || ' ' || b.model, b.brand, b.model, 'N/A') as model,
      b.brand,
      b.year_of_manufacture as year,
      COALESCE(bo.km_driven, 0) as "kmDriven",
      COALESCE(bf.fuel_used, 0) as "fuelUsed",
      COALESCE(bf.fuel_cost, 0) as "fuelCost",
      COALESCE(bf.trips, 0) as trips,
      CASE 
        WHEN COALESCE(bf.fuel_used, 0) > 0 AND COALESCE(bo.km_driven, 0) > 0
        THEN ROUND((bo.km_driven::numeric / bf.fuel_used), 2)
        ELSE 0 
      END as "avgEfficiency"
    FROM bus b
    INNER JOIN bus_fuel bf ON b.id = bf.bus_id
    LEFT JOIN bus_odo bo ON b.id = bo.bus_id
    ORDER BY "kmDriven" DESC
  `;
  
  const result = await query(queryText, params);
  return result.rows;
};

/**
 * Get all fuel entries for a specific driver
 */
export const findFuelEntriesByDriverId = async (driverId, range = 'month') => {
  const startDate = getDateRangeFilter(range);
  const params = [driverId];
  let dateCondition = '';
  
  if (startDate) {
    dateCondition = 'AND fe.fuel_date >= $2';
    params.push(startDate);
  }
  
  const queryText = `
    SELECT 
      fe.id,
      fe.fuel_date as date,
      b.id as "busId",
      b.no_plate as "busRegNumber",
      COALESCE(b.brand || ' ' || b.model, b.brand, b.model, 'N/A') as "busModel",
      fe.odometer_at_fueling as "odometerAtFueling",
      (
        SELECT reading_km 
        FROM odometer_reading 
        WHERE assignment_id = fe.assignment_id 
        AND reading_date = fe.fuel_date
        AND reading_type = 'morning'
        LIMIT 1
      ) as "startOdometer",
      (
        SELECT reading_km 
        FROM odometer_reading 
        WHERE assignment_id = fe.assignment_id 
        AND reading_date = fe.fuel_date
        AND reading_type = 'evening'
        LIMIT 1
      ) as "endOdometer",
      fe.liters_filled as "fuelLiters",
      fe.total_cost as "fuelCost",
      fe.price_per_liter as "pricePerLiter",
      fe.fuel_station as station,
      fe.notes,
      fe.created_at as "createdAt"
    FROM fuel_entries fe
    LEFT JOIN bus b ON fe.bus_id = b.id
    WHERE fe.driver_id = $1 ${dateCondition}
    ORDER BY fe.fuel_date DESC, fe.created_at DESC
  `;
  
  const result = await query(queryText, params);
  
  return result.rows.map(entry => {
    const startOdo = parseFloat(entry.startOdometer) || 0;
    const endOdo = parseFloat(entry.endOdometer) || parseFloat(entry.odometerAtFueling) || 0;
    const kmTraveled = endOdo > startOdo ? endOdo - startOdo : 0;
    const fuelLiters = parseFloat(entry.fuelLiters) || 0;
    const efficiency = fuelLiters > 0 && kmTraveled > 0 ? (kmTraveled / fuelLiters) : 0;
    
    return {
      ...entry,
      startOdometer: startOdo,
      endOdometer: endOdo,
      kmTraveled,
      efficiency: Math.round(efficiency * 100) / 100
    };
  });
};

// ==========================================
// LEADERBOARD & ALERTS QUERIES
// ==========================================

/**
 * Get top performing drivers
 */
export const findTopDrivers = async (limit = 10, range = 'month') => {
  const startDate = getDateRangeFilter(range);
  const params = [parseInt(limit)];
  let dateCondition = '';
  let odoDateCondition = '';
  
  if (startDate) {
    dateCondition = 'AND fe.fuel_date >= $2';
    odoDateCondition = 'WHERE reading_date >= $2';
    params.push(startDate);
  }
  
  const queryText = `
    WITH driver_odometer AS (
      SELECT 
        driver_id,
        MAX(reading_km) - MIN(reading_km) as total_distance,
        COUNT(DISTINCT bus_id) as bus_count
      FROM odometer_reading
      ${startDate ? 'WHERE reading_date >= $2' : ''}
      GROUP BY driver_id
    ),
    driver_fuel AS (
      SELECT 
        fe.driver_id,
        COUNT(fe.id) as trips,
        COALESCE(SUM(fe.liters_filled), 0) as total_fuel,
        COALESCE(SUM(fe.total_cost), 0) as total_cost,
        COUNT(DISTINCT fe.bus_id) as bus_count
      FROM fuel_entries fe
      WHERE 1=1 ${dateCondition}
      GROUP BY fe.driver_id
    )
    SELECT 
      u.id as "driverId",
      u.name,
      u.employe_number as "employeeNo",
      u.mobile as phone,
      COALESCE(doo.total_distance, 0) as "totalKm",
      COALESCE(df.total_fuel, 0) as "totalFuel",
      COALESCE(df.total_cost, 0) as "totalCost",
      COALESCE(df.trips, 0) as trips,
      COALESCE(df.bus_count, doo.bus_count, 0) as "busCount",
      CASE 
        WHEN COALESCE(df.total_fuel, 0) > 0 AND COALESCE(doo.total_distance, 0) > 0
        THEN ROUND((doo.total_distance::numeric / df.total_fuel), 2)
        ELSE 0 
      END as "avgKmPerLiter"
    FROM users u
    INNER JOIN driver_fuel df ON u.id = df.driver_id
    LEFT JOIN driver_odometer doo ON u.id = doo.driver_id
    WHERE u.role = 'driver'
    AND COALESCE(df.total_fuel, 0) > 0
    ORDER BY "avgKmPerLiter" DESC
    LIMIT $1
  `;
  
  const result = await query(queryText, params);
  return result.rows;
};

/**
 * Get buses with low efficiency (alerts)
 */
export const findLowEfficiencyBuses = async (threshold = 3.0, range = 'week') => {
  const startDate = getDateRangeFilter(range);
  const params = startDate ? [startDate] : [];
  let dateCondition = startDate ? 'AND fe.fuel_date >= $1' : '';
  let odoDateCondition = startDate ? 'WHERE reading_date >= $1' : '';
  
  const queryText = `
    WITH bus_odometer AS (
      SELECT 
        bus_id,
        MAX(reading_km) - MIN(reading_km) as total_distance
      FROM odometer_reading
      ${odoDateCondition}
      GROUP BY bus_id
    ),
    bus_fuel AS (
      SELECT 
        fe.bus_id,
        COUNT(fe.id) as trips,
        COALESCE(SUM(fe.liters_filled), 0) as total_fuel
      FROM fuel_entries fe
      WHERE 1=1 ${dateCondition}
      GROUP BY fe.bus_id
    )
    SELECT 
      b.id as "busId",
      b.no_plate as "regNumber",
      COALESCE(b.brand || ' ' || b.model, b.brand, b.model, 'N/A') as model,
      COALESCE(bo.total_distance, 0) as "totalKm",
      COALESCE(bf.total_fuel, 0) as "totalFuel",
      COALESCE(bf.trips, 0) as trips,
      ROUND((bo.total_distance::numeric / NULLIF(bf.total_fuel, 0)), 2) as efficiency
    FROM bus b
    INNER JOIN bus_fuel bf ON b.id = bf.bus_id
    LEFT JOIN bus_odometer bo ON b.id = bo.bus_id
    WHERE bf.total_fuel > 0 
      AND bo.total_distance > 0
      AND (bo.total_distance::numeric / bf.total_fuel) < ${threshold}
    ORDER BY efficiency ASC
  `;
  
  const result = await query(queryText, params);
  return result.rows;
};

/**
 * Get drivers with low efficiency (alerts)
 */
export const findLowEfficiencyDrivers = async (threshold = 3.0, range = 'week') => {
  const startDate = getDateRangeFilter(range);
  const params = startDate ? [startDate] : [];
  let dateCondition = startDate ? 'AND fe.fuel_date >= $1' : '';
  let odoDateCondition = startDate ? 'WHERE reading_date >= $1' : '';
  
  const queryText = `
    WITH driver_odometer AS (
      SELECT 
        driver_id,
        MAX(reading_km) - MIN(reading_km) as total_distance
      FROM odometer_reading
      ${odoDateCondition}
      GROUP BY driver_id
    ),
    driver_fuel AS (
      SELECT 
        fe.driver_id,
        COUNT(fe.id) as trips,
        COALESCE(SUM(fe.liters_filled), 0) as total_fuel
      FROM fuel_entries fe
      WHERE 1=1 ${dateCondition}
      GROUP BY fe.driver_id
    )
    SELECT 
      u.id as "driverId",
      u.name,
      u.employe_number as "employeeNo",
      COALESCE(doo.total_distance, 0) as "totalKm",
      COALESCE(df.total_fuel, 0) as "totalFuel",
      COALESCE(df.trips, 0) as trips,
      ROUND((doo.total_distance::numeric / NULLIF(df.total_fuel, 0)), 2) as efficiency
    FROM users u
    INNER JOIN driver_fuel df ON u.id = df.driver_id
    LEFT JOIN driver_odometer doo ON u.id = doo.driver_id
    WHERE u.role = 'driver'
      AND df.total_fuel > 0 
      AND doo.total_distance > 0
      AND (doo.total_distance::numeric / df.total_fuel) < ${threshold}
    ORDER BY efficiency ASC
  `;
  
  const result = await query(queryText, params);
  return result.rows;
};

// Export all functions
export default {
  findAllBusesEfficiency,
  findBusEfficiencyById,
  findDriversByBusId,
  findFuelEntriesByBusId,
  findAllDriversEfficiency,
  findDriverEfficiencyById,
  findBusesByDriverId,
  findFuelEntriesByDriverId,
  findTopDrivers,
  findLowEfficiencyBuses,
  findLowEfficiencyDrivers
};