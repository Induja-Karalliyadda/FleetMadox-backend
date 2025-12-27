// Bus Fitness Controller
// File: controllers/Busfitnesscontroller.js

import * as busFitnessService from '../services/Busfitnessservice.js';

// ==========================================
// GET ALL FITNESS RECORDS
// ==========================================
export const getAllFitnessRecords = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'check_date', order = 'DESC' } = req.query;
    
    const result = await busFitnessService.getAllFitnessRecords({
      page,
      limit,
      sortBy,
      order
    });
    
    res.json({
      success: true,
      data: result.records,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching fitness records:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch fitness records'
    });
  }
};

// ==========================================
// GET FITNESS RECORDS BY DATE
// ==========================================
export const getFitnessRecordsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const records = await busFitnessService.getFitnessRecordsByDate(date);
    
    res.json({
      success: true,
      data: records,
      date: date
    });
  } catch (error) {
    console.error('Error fetching fitness records by date:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch fitness records'
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
    
    const records = await busFitnessService.getFitnessRecordsByBus(busId, { startDate, endDate });
    
    res.json({
      success: true,
      data: records,
      busId: parseInt(busId)
    });
  } catch (error) {
    console.error('Error fetching fitness records by bus:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch fitness records'
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
    
    const history = await busFitnessService.getBusHistoryWithDrivers(busId, parseInt(limit));
    
    res.json({
      success: true,
      data: history,
      busId: parseInt(busId)
    });
  } catch (error) {
    console.error('Error fetching bus history:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch bus history'
    });
  }
};

// ==========================================
// GET BUS CHECK STATUS FOR DATE
// ==========================================
export const getBusCheckStatus = async (req, res) => {
  try {
    const { date } = req.params;
    
    const status = await busFitnessService.getBusCheckStatus(date);
    
    res.json({
      success: true,
      data: status,
      date: date
    });
  } catch (error) {
    console.error('Error fetching bus check status:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch bus check status'
    });
  }
};

// ==========================================
// GET TODAY'S ASSIGNMENTS WITH CHECK STATUS
// ==========================================
export const getTodayAssignmentsWithStatus = async (req, res) => {
  try {
    const { date } = req.query;
    
    const result = await busFitnessService.getTodayAssignmentsWithStatus(date);
    
    res.json({
      success: true,
      data: result.assignments,
      date: result.date
    });
  } catch (error) {
    console.error('Error fetching assignments with status:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch assignments'
    });
  }
};

// ==========================================
// GET FITNESS RECORD BY ID
// ==========================================
export const getFitnessRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const record = await busFitnessService.getFitnessRecordById(id);
    
    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching fitness record:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch fitness record'
    });
  }
};

// ==========================================
// CREATE FITNESS RECORD
// ==========================================
export const createFitnessRecord = async (req, res) => {
  try {
    const driverId = req.user.id;
    
    const newRecord = await busFitnessService.createFitnessRecord(req.body, driverId);
    
    res.status(201).json({
      success: true,
      message: 'Fitness check submitted successfully',
      data: newRecord
    });
  } catch (error) {
    console.error('Error creating fitness record:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create fitness record'
    });
  }
};

// ==========================================
// UPDATE FITNESS RECORD
// ==========================================
export const updateFitnessRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedRecord = await busFitnessService.updateFitnessRecord(id, req.body, req.user);
    
    res.json({
      success: true,
      message: 'Fitness record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error updating fitness record:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update fitness record'
    });
  }
};

// ==========================================
// DELETE FITNESS RECORD
// ==========================================
export const deleteFitnessRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    await busFitnessService.deleteFitnessRecord(id);
    
    res.json({
      success: true,
      message: 'Fitness record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting fitness record:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete fitness record'
    });
  }
};

// ==========================================
// GET FITNESS SUMMARY STATISTICS
// ==========================================
export const getFitnessSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const summary = await busFitnessService.getFitnessSummary({ startDate, endDate });
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching fitness summary:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch fitness summary'
    });
  }
};