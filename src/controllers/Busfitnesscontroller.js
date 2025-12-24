// Bus Fitness Controller
// File: controllers/Busfitnesscontroller.js

import * as busFitnessRepository from '../repositories/Busfitnessrepository.js';

// ==========================================
// GET ALL FITNESS RECORDS
// ==========================================
export const getAllFitnessRecords = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'check_date', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    
    const records = await busFitnessRepository.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      order
    });
    
    const total = await busFitnessRepository.count();
    
    res.json({
      success: true,
      data: records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching fitness records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fitness records',
      error: error.message
    });
  }
};

// ==========================================
// GET FITNESS RECORDS BY DATE
// ==========================================
export const getFitnessRecordsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    const records = await busFitnessRepository.findByDate(date);
    
    res.json({
      success: true,
      data: records,
      date: date
    });
  } catch (error) {
    console.error('Error fetching fitness records by date:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fitness records',
      error: error.message
    });
  }
};

// ==========================================
// GET FITNESS RECORDS BY BUS
// ==========================================
export const getFitnessRecordsByBus = async (req, res) => {
  try {
    const { busId } = req.params;
    const { startDate, endDate } = req.query;
    
    const records = await busFitnessRepository.findByBusId(busId, { startDate, endDate });
    
    res.json({
      success: true,
      data: records,
      busId: parseInt(busId)
    });
  } catch (error) {
    console.error('Error fetching fitness records by bus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fitness records',
      error: error.message
    });
  }
};

// ==========================================
// GET BUS HISTORY WITH DRIVER DETAILS
// ==========================================
export const getBusHistoryWithDrivers = async (req, res) => {
  try {
    const { busId } = req.params;
    const { limit = 50 } = req.query;
    
    const history = await busFitnessRepository.getBusHistoryWithDriverDetails(busId, parseInt(limit));
    
    res.json({
      success: true,
      data: history,
      busId: parseInt(busId)
    });
  } catch (error) {
    console.error('Error fetching bus history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus history',
      error: error.message
    });
  }
};

// ==========================================
// GET BUS CHECK STATUS FOR DATE
// ==========================================
export const getBusCheckStatus = async (req, res) => {
  try {
    const { date } = req.params;
    
    const status = await busFitnessRepository.getBusCheckStatusByDate(date);
    
    res.json({
      success: true,
      data: status,
      date: date
    });
  } catch (error) {
    console.error('Error fetching bus check status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus check status',
      error: error.message
    });
  }
};

// ==========================================
// GET TODAY'S ASSIGNMENTS WITH CHECK STATUS
// ==========================================
export const getTodayAssignmentsWithStatus = async (req, res) => {
  try {
    const { date } = req.query;
    const checkDate = date || new Date().toISOString().split('T')[0];
    
    const assignments = await busFitnessRepository.getAssignmentsWithCheckStatus(checkDate);
    
    res.json({
      success: true,
      data: assignments,
      date: checkDate
    });
  } catch (error) {
    console.error('Error fetching assignments with status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
};

// ==========================================
// GET FITNESS RECORD BY ID
// ==========================================
export const getFitnessRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await busFitnessRepository.findById(id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      });
    }
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching fitness record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fitness record',
      error: error.message
    });
  }
};

// ==========================================
// CREATE FITNESS RECORD
// ==========================================
export const createFitnessRecord = async (req, res) => {
  try {
    const {
      assignment_id,
      bus_id,
      oil_level,
      oil_checked,
      water_level,
      water_checked,
      notes,
      check_date
    } = req.body;
    
    // Get driver_id from authenticated user
    const driver_id = req.user.id;
    
    // Validate required fields
    if (!assignment_id || !bus_id) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID and Bus ID are required'
      });
    }
    
    // Check if a fitness record already exists for this assignment on this date
    const existingRecord = await busFitnessRepository.findByAssignmentAndDate(
      assignment_id,
      check_date || new Date().toISOString().split('T')[0]
    );
    
    if (existingRecord) {
      return res.status(409).json({
        success: false,
        message: 'Fitness check already submitted for this assignment today'
      });
    }
    
    const newRecord = await busFitnessRepository.create({
      assignment_id,
      driver_id,
      bus_id,
      oil_level: oil_level || 'full',
      oil_checked: oil_checked !== undefined ? oil_checked : true,
      water_level: water_level || 'full',
      water_checked: water_checked !== undefined ? water_checked : true,
      notes: notes || '',
      check_date: check_date || new Date().toISOString().split('T')[0]
    });
    
    res.status(201).json({
      success: true,
      message: 'Fitness check submitted successfully',
      data: newRecord
    });
  } catch (error) {
    console.error('Error creating fitness record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create fitness record',
      error: error.message
    });
  }
};

// ==========================================
// UPDATE FITNESS RECORD
// ==========================================
export const updateFitnessRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const existingRecord = await busFitnessRepository.findById(id);
    
    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      });
    }
    
    // Check if user is authorized to update (admin or the driver who created it)
    if (req.user.role !== 'admin' && req.user.id !== existingRecord.driver_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this record'
      });
    }
    
    const updatedRecord = await busFitnessRepository.update(id, updates);
    
    res.json({
      success: true,
      message: 'Fitness record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error updating fitness record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update fitness record',
      error: error.message
    });
  }
};

// ==========================================
// DELETE FITNESS RECORD
// ==========================================
export const deleteFitnessRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingRecord = await busFitnessRepository.findById(id);
    
    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      });
    }
    
    await busFitnessRepository.deleteRecord(id);
    
    res.json({
      success: true,
      message: 'Fitness record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting fitness record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete fitness record',
      error: error.message
    });
  }
};

// ==========================================
// GET FITNESS SUMMARY STATISTICS
// ==========================================
export const getFitnessSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const summary = await busFitnessRepository.getSummaryStats({ startDate, endDate });
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching fitness summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fitness summary',
      error: error.message
    });
  }
};