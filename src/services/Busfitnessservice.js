// Bus Fitness Service Layer
// File: services/Busfitnessservice.js

import * as busFitnessRepository from '../repositories/Busfitnessrepository.js';

// ==========================================
// GET ALL FITNESS RECORDS
// ==========================================
export const getAllFitnessRecords = async ({ page = 1, limit = 20, sortBy = 'check_date', order = 'DESC' }) => {
  const offset = (page - 1) * limit;
  
  const records = await busFitnessRepository.findAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    sortBy,
    order
  });
  
  const total = await busFitnessRepository.count();
  
  return {
    records,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// ==========================================
// GET FITNESS RECORDS BY DATE
// ==========================================
export const getFitnessRecordsByDate = async (date) => {
  if (!date) {
    throw new Error('Date parameter is required');
  }
  
  const records = await busFitnessRepository.findByDate(date);
  return records;
};

// ==========================================
// GET FITNESS RECORDS BY BUS
// ==========================================
export const getFitnessRecordsByBus = async (busId, { startDate, endDate } = {}) => {
  if (!busId) {
    throw new Error('Bus ID is required');
  }
  
  const records = await busFitnessRepository.findByBusId(busId, { startDate, endDate });
  return records;
};

// ==========================================
// GET BUS HISTORY WITH DRIVER DETAILS
// ==========================================
export const getBusHistoryWithDrivers = async (busId, limit = 50) => {
  if (!busId) {
    throw new Error('Bus ID is required');
  }
  
  const history = await busFitnessRepository.getBusHistoryWithDriverDetails(busId, parseInt(limit));
  return history;
};

// ==========================================
// GET BUS CHECK STATUS FOR DATE
// ==========================================
export const getBusCheckStatus = async (date) => {
  if (!date) {
    throw new Error('Date parameter is required');
  }
  
  const status = await busFitnessRepository.getBusCheckStatusByDate(date);
  return status;
};

// ==========================================
// GET TODAY'S ASSIGNMENTS WITH CHECK STATUS
// ==========================================
export const getTodayAssignmentsWithStatus = async (date) => {
  const checkDate = date || new Date().toISOString().split('T')[0];
  const assignments = await busFitnessRepository.getAssignmentsWithCheckStatus(checkDate);
  return { assignments, date: checkDate };
};

// ==========================================
// GET FITNESS RECORD BY ID
// ==========================================
export const getFitnessRecordById = async (id) => {
  if (!id) {
    throw new Error('Record ID is required');
  }
  
  const record = await busFitnessRepository.findById(id);
  
  if (!record) {
    const error = new Error('Fitness record not found');
    error.statusCode = 404;
    throw error;
  }
  
  return record;
};

// ==========================================
// CREATE FITNESS RECORD
// ==========================================
export const createFitnessRecord = async (data, driverId) => {
  const {
    assignment_id,
    bus_id,
    oil_level,
    oil_checked,
    water_level,
    water_checked,
    notes,
    check_date
  } = data;
  
  // Validate required fields
  if (!assignment_id || !bus_id) {
    const error = new Error('Assignment ID and Bus ID are required');
    error.statusCode = 400;
    throw error;
  }
  
  const fitnessCheckDate = check_date || new Date().toISOString().split('T')[0];
  
  // Check if a fitness record already exists for this assignment on this date
  const existingRecord = await busFitnessRepository.findByAssignmentAndDate(
    assignment_id,
    fitnessCheckDate
  );
  
  if (existingRecord) {
    const error = new Error('Fitness check already submitted for this assignment today');
    error.statusCode = 409;
    throw error;
  }
  
  const newRecord = await busFitnessRepository.create({
    assignment_id,
    driver_id: driverId,
    bus_id,
    oil_level: oil_level || 'full',
    oil_checked: oil_checked !== undefined ? oil_checked : true,
    water_level: water_level || 'full',
    water_checked: water_checked !== undefined ? water_checked : true,
    notes: notes || '',
    check_date: fitnessCheckDate
  });
  
  return newRecord;
};

// ==========================================
// UPDATE FITNESS RECORD
// ==========================================
export const updateFitnessRecord = async (id, updates, user) => {
  const existingRecord = await busFitnessRepository.findById(id);
  
  if (!existingRecord) {
    const error = new Error('Fitness record not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Check if user is authorized to update (admin or the driver who created it)
  if (user.role !== 'admin' && user.id !== existingRecord.driver_id) {
    const error = new Error('Not authorized to update this record');
    error.statusCode = 403;
    throw error;
  }
  
  const updatedRecord = await busFitnessRepository.update(id, updates);
  return updatedRecord;
};

// ==========================================
// DELETE FITNESS RECORD
// ==========================================
export const deleteFitnessRecord = async (id) => {
  const existingRecord = await busFitnessRepository.findById(id);
  
  if (!existingRecord) {
    const error = new Error('Fitness record not found');
    error.statusCode = 404;
    throw error;
  }
  
  await busFitnessRepository.deleteRecord(id);
  return { success: true };
};

// ==========================================
// GET FITNESS SUMMARY STATISTICS
// ==========================================
export const getFitnessSummary = async ({ startDate, endDate } = {}) => {
  const summary = await busFitnessRepository.getSummaryStats({ startDate, endDate });
  return summary;
};

// ==========================================
// GET DAILY CHECK SUMMARY BY BUS
// ==========================================
export const getDailyCheckSummaryByBus = async (date) => {
  if (!date) {
    throw new Error('Date parameter is required');
  }
  
  const summary = await busFitnessRepository.getDailyCheckSummaryByBus(date);
  return summary;
};