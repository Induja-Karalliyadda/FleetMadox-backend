import { pool } from '../config/db.js';

/**
 * TodayRoute Repository
 * Handles all database operations for the MyTodayRoute feature
 */
class TodayRouteRepository {
  /**
   * Get today's assignment for a driver
   */
  async getTodayAssignment(driverId, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const queryText = `
      SELECT 
        vda.vehicle_driver_assignmentid as "assignmentId",
        vda.vehicle_id as "vehicleId",
        vda.employee_id as "employeeId",
        vda.start_date as "startDate",
        vda.end_date as "endDate",
        vda.route,
        vda.created_at as "createdAt",
        vda.update_at as "updatedAt",
        b.id as "busId",
        b.no_plate as "busNumber",
        b.brand as "busBrand",
        b.model as "busModel",
        b.number_of_seats as "numberOfSeats",
        b.fuel_type as "fuelType",
        b.fuel_tank_capacity as "fuelTankCapacity",
        b.engine_cc as "engineCc",
        b.year_of_manufacture as "yearOfManufacture",
        u.name as "driverName",
        u.employe_number as "driverEmployeeNumber"
      FROM vehicle_driver_assignment vda
      JOIN bus b ON vda.vehicle_id = b.id
      JOIN users u ON vda.employee_id = u.id
      WHERE vda.employee_id = $1
        AND $2::date >= DATE(vda.start_date)
        AND $2::date <= DATE(vda.end_date)
      ORDER BY vda.start_date DESC
      LIMIT 1
    `;

    const result = await pool.query(queryText, [driverId, targetDate]);
    
    if (result.rows[0]) {
      const row = result.rows[0];
      const endDate = new Date(row.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = endDate - today;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...row,
        busModelFull: `${row.busBrand || ''} ${row.busModel || ''}`.trim(),
        daysRemaining: daysRemaining >= 0 ? daysRemaining : 0,
        status: this.getAssignmentStatus(row.startDate, row.endDate)
      };
    }
    
    return null;
  }

  getAssignmentStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  }

  async getActiveAssignments(driverId) {
    const queryText = `
      SELECT 
        vda.vehicle_driver_assignmentid as "assignmentId",
        vda.vehicle_id as "vehicleId",
        vda.employee_id as "employeeId",
        vda.start_date as "startDate",
        vda.end_date as "endDate",
        vda.route,
        b.no_plate as "busNumber",
        b.brand as "busBrand",
        b.model as "busModel",
        u.name as "driverName"
      FROM vehicle_driver_assignment vda
      JOIN bus b ON vda.vehicle_id = b.id
      JOIN users u ON vda.employee_id = u.id
      WHERE vda.employee_id = $1
        AND vda.end_date >= CURRENT_DATE
      ORDER BY vda.start_date ASC
    `;

    const result = await pool.query(queryText, [driverId]);
    return result.rows;
  }
}

/**
 * BusFitness Repository
 */
class BusFitnessRepository {
  async getByAssignmentAndDate(assignmentId, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const queryText = `
      SELECT 
        id,
        assignment_id as "assignmentId",
        driver_id as "driverId",
        bus_id as "busId",
        oil_level as "oilLevel",
        oil_checked as "oilChecked",
        water_level as "waterLevel",
        water_checked as "waterChecked",
        notes,
        check_date as "checkDate",
        submitted_at as "submittedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM bus_fitness
      WHERE assignment_id = $1 AND check_date = $2
    `;

    const result = await pool.query(queryText, [assignmentId, targetDate]);
    return result.rows[0] || null;
  }

  async upsert(data) {
    const queryText = `
      INSERT INTO bus_fitness (
        assignment_id, driver_id, bus_id, oil_level, oil_checked,
        water_level, water_checked, notes, check_date, submitted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (assignment_id, check_date)
      DO UPDATE SET
        oil_level = EXCLUDED.oil_level,
        oil_checked = EXCLUDED.oil_checked,
        water_level = EXCLUDED.water_level,
        water_checked = EXCLUDED.water_checked,
        notes = EXCLUDED.notes,
        submitted_at = EXCLUDED.submitted_at,
        updated_at = CURRENT_TIMESTAMP
      RETURNING 
        id,
        assignment_id as "assignmentId",
        driver_id as "driverId",
        bus_id as "busId",
        oil_level as "oilLevel",
        oil_checked as "oilChecked",
        water_level as "waterLevel",
        water_checked as "waterChecked",
        notes,
        check_date as "checkDate",
        submitted_at as "submittedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pool.query(queryText, [
      data.assignmentId,
      data.driverId,
      data.busId,
      data.oilLevel,
      data.oilChecked,
      data.waterLevel,
      data.waterChecked,
      data.notes || '',
      data.checkDate || new Date().toISOString().split('T')[0],
      data.submittedAt || new Date().toISOString()
    ]);

    return result.rows[0];
  }

  async getHistoryByBus(busId, limit = 30) {
    const queryText = `
      SELECT 
        id,
        assignment_id as "assignmentId",
        driver_id as "driverId",
        bus_id as "busId",
        oil_level as "oilLevel",
        oil_checked as "oilChecked",
        water_level as "waterLevel",
        water_checked as "waterChecked",
        notes,
        check_date as "checkDate",
        submitted_at as "submittedAt"
      FROM bus_fitness
      WHERE bus_id = $1
      ORDER BY check_date DESC
      LIMIT $2
    `;

    const result = await pool.query(queryText, [busId, limit]);
    return result.rows;
  }

  async getCriticalAlerts() {
    const queryText = `
      SELECT 
        bf.*,
        b.no_plate as "busNumber",
        u.name as "driverName"
      FROM bus_fitness bf
      JOIN bus b ON bf.bus_id = b.id
      JOIN users u ON bf.driver_id = u.id
      WHERE (bf.oil_level = 'critical' OR bf.water_level = 'critical')
        AND bf.check_date = CURRENT_DATE
      ORDER BY bf.created_at DESC
    `;

    const result = await pool.query(queryText);
    return result.rows;
  }
}

/**
 * OdometerReading Repository
 */
class OdometerReadingRepository {
  async getByAssignmentTypeAndDate(assignmentId, readingType, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const queryText = `
      SELECT 
        id,
        assignment_id as "assignmentId",
        driver_id as "driverId",
        bus_id as "busId",
        reading_type as "readingType",
        reading_km as "readingKm",
        reading_date as "readingDate",
        submitted_at as "submittedAt"
      FROM odometer_reading
      WHERE assignment_id = $1 AND reading_type = $2 AND reading_date = $3
    `;

    const result = await pool.query(queryText, [assignmentId, readingType, targetDate]);
    return result.rows[0] || null;
  }

  async getTodayReadings(assignmentId, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const queryText = `
      SELECT 
        id,
        assignment_id as "assignmentId",
        driver_id as "driverId",
        bus_id as "busId",
        reading_type as "readingType",
        reading_km as "readingKm",
        reading_date as "readingDate",
        submitted_at as "submittedAt"
      FROM odometer_reading
      WHERE assignment_id = $1 AND reading_date = $2
      ORDER BY reading_type
    `;

    const result = await pool.query(queryText, [assignmentId, targetDate]);
    
    const readings = { morning: null, evening: null };
    result.rows.forEach(row => {
      if (row.readingType === 'morning') {
        readings.morning = row;
      } else if (row.readingType === 'evening') {
        readings.evening = row;
      }
    });

    return readings;
  }

  async getPreviousDayReadings(busId, beforeDate = null) {
    const targetDate = beforeDate || new Date().toISOString().split('T')[0];
    
    const queryText = `
      SELECT 
        m.assignment_id as "assignmentId",
        m.driver_id as "driverId",
        m.bus_id as "busId",
        m.reading_date as "readingDate",
        m.reading_km AS "morningReading",
        e.reading_km AS "eveningReading",
        COALESCE(e.reading_km - m.reading_km, 0) AS "distanceTraveled",
        m.submitted_at AS "morningSubmittedAt",
        e.submitted_at AS "eveningSubmittedAt"
      FROM odometer_reading m
      LEFT JOIN odometer_reading e ON m.bus_id = e.bus_id 
        AND m.reading_date = e.reading_date 
        AND e.reading_type = 'evening'
      WHERE m.bus_id = $1 
        AND m.reading_type = 'morning'
        AND m.reading_date < $2
      ORDER BY m.reading_date DESC
      LIMIT 1
    `;

    const result = await pool.query(queryText, [busId, targetDate]);
    return result.rows[0] || null;
  }

  async createReading(data) {
    const queryText = `
      INSERT INTO odometer_reading (
        assignment_id, driver_id, bus_id, reading_type, reading_km, reading_date, submitted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (assignment_id, reading_type, reading_date)
      DO UPDATE SET
        reading_km = EXCLUDED.reading_km,
        submitted_at = EXCLUDED.submitted_at,
        updated_at = CURRENT_TIMESTAMP
      RETURNING 
        id,
        assignment_id as "assignmentId",
        driver_id as "driverId",
        bus_id as "busId",
        reading_type as "readingType",
        reading_km as "readingKm",
        reading_date as "readingDate",
        submitted_at as "submittedAt"
    `;

    const result = await pool.query(queryText, [
      data.assignmentId,
      data.driverId,
      data.busId,
      data.readingType,
      data.readingKm,
      data.readingDate || new Date().toISOString().split('T')[0],
      new Date().toISOString()
    ]);

    return result.rows[0];
  }

  async getDailyDistanceSummary(busId, days = 30) {
    const queryText = `
      SELECT 
        m.assignment_id as "assignmentId",
        m.driver_id as "driverId",
        m.bus_id as "busId",
        m.reading_date as "readingDate",
        m.reading_km AS "morningReading",
        e.reading_km AS "eveningReading",
        COALESCE(e.reading_km - m.reading_km, 0) AS "distanceTraveled",
        m.submitted_at AS "morningSubmittedAt",
        e.submitted_at AS "eveningSubmittedAt"
      FROM odometer_reading m
      LEFT JOIN odometer_reading e ON m.bus_id = e.bus_id 
        AND m.reading_date = e.reading_date 
        AND e.reading_type = 'evening'
      WHERE m.bus_id = $1 
        AND m.reading_type = 'morning'
        AND m.reading_date >= CURRENT_DATE - $2
      ORDER BY m.reading_date DESC
    `;

    const result = await pool.query(queryText, [busId, days]);
    return result.rows;
  }

  async getLatestReading(busId) {
    const queryText = `
      SELECT reading_km as "readingKm" FROM odometer_reading
      WHERE bus_id = $1
      ORDER BY reading_date DESC, 
        CASE reading_type WHEN 'evening' THEN 1 ELSE 2 END
      LIMIT 1
    `;

    const result = await pool.query(queryText, [busId]);
    return result.rows[0]?.readingKm || 0;
  }
}

/**
 * FuelEntry Repository
 */
class FuelEntryRepository {
  async createEntry(data) {
    const queryText = `
      INSERT INTO fuel_entries (
        assignment_id, driver_id, bus_id, odometer_at_fueling,
        liters_filled, price_per_liter, total_cost, fuel_station, notes, fuel_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id,
        assignment_id as "assignmentId",
        driver_id as "driverId",
        bus_id as "busId",
        odometer_at_fueling as "odometerAtFueling",
        liters_filled as "litersFilled",
        price_per_liter as "pricePerLiter",
        total_cost as "totalCost",
        fuel_station as "fuelStation",
        notes,
        fuel_date as "fuelDate",
        created_at as "createdAt"
    `;

    const result = await pool.query(queryText, [
      data.assignmentId,
      data.driverId,
      data.busId,
      data.odometerAtFueling,
      data.litersFilled,
      data.pricePerLiter,
      data.totalCost,
      data.fuelStation,
      data.notes || '',
      data.fuelDate || new Date().toISOString().split('T')[0]
    ]);

    return result.rows[0];
  }

  async getByBus(busId, limit = 50) {
    const queryText = `
      SELECT 
        id,
        assignment_id as "assignmentId",
        driver_id as "driverId",
        bus_id as "busId",
        odometer_at_fueling as "odometerAtFueling",
        liters_filled as "litersFilled",
        price_per_liter as "pricePerLiter",
        total_cost as "totalCost",
        fuel_station as "fuelStation",
        notes,
        fuel_date as "fuelDate",
        created_at as "createdAt"
      FROM fuel_entries
      WHERE bus_id = $1
      ORDER BY odometer_at_fueling DESC
      LIMIT $2
    `;

    const result = await pool.query(queryText, [busId, limit]);
    return result.rows;
  }

  async getByDriver(driverId, limit = 50) {
    const queryText = `
      SELECT 
        id,
        assignment_id as "assignmentId",
        driver_id as "driverId",
        bus_id as "busId",
        odometer_at_fueling as "odometerAtFueling",
        liters_filled as "litersFilled",
        price_per_liter as "pricePerLiter",
        total_cost as "totalCost",
        fuel_station as "fuelStation",
        notes,
        fuel_date as "fuelDate",
        created_at as "createdAt"
      FROM fuel_entries
      WHERE driver_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(queryText, [driverId, limit]);
    return result.rows;
  }

  async getTotalCostByDateRange(busId, startDate, endDate) {
    const queryText = `
      SELECT 
        COALESCE(SUM(total_cost), 0) as "totalCost",
        COALESCE(SUM(liters_filled), 0) as "totalLiters",
        COUNT(*) as "entries"
      FROM fuel_entries
      WHERE bus_id = $1
        AND fuel_date >= $2
        AND fuel_date <= $3
    `;

    const result = await pool.query(queryText, [busId, startDate, endDate]);
    return {
      totalCost: parseFloat(result.rows[0].totalCost),
      totalLiters: parseFloat(result.rows[0].totalLiters),
      entries: parseInt(result.rows[0].entries, 10)
    };
  }
}

export {
  TodayRouteRepository,
  BusFitnessRepository,
  OdometerReadingRepository,
  FuelEntryRepository
};
