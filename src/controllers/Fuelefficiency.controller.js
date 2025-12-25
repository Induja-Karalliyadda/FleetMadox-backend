/**
 * Fuel Efficiency Controller
 * HTTP request handlers for fuel efficiency endpoints
 * File: controllers/Fuelefficiency.controller.js
 */

import * as fuelEfficiencyService from '../services/Fuelefficiency.service.js';

// ==========================================
// BUS EFFICIENCY CONTROLLERS
// ==========================================

/**
 * GET /api/fuel-efficiency/buses
 * Get all buses with efficiency rankings
 */
export const getBusEfficiency = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    
    const data = await fuelEfficiencyService.getAllBusesEfficiency(range);
    
    res.json({
      success: true,
      data,
      range,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching bus efficiency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus efficiency data',
      error: error.message
    });
  }
};

/**
 * GET /api/fuel-efficiency/buses/:busId
 * Get single bus efficiency by ID
 */
export const getBusEfficiencyById = async (req, res) => {
  try {
    const { busId } = req.params;
    const { range = 'month' } = req.query;
    
    const data = await fuelEfficiencyService.getBusEfficiencyById(busId, range);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }
    
    res.json({
      success: true,
      data,
      range
    });
  } catch (error) {
    console.error('Error fetching bus efficiency by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus efficiency data',
      error: error.message
    });
  }
};

/**
 * GET /api/fuel-efficiency/bus/:busId/full-report
 * Get full bus report with drivers and fuel entries
 */
export const getBusFullReport = async (req, res) => {
  try {
    const { busId } = req.params;
    const { range = 'month' } = req.query;
    
    const data = await fuelEfficiencyService.getBusFullReport(busId, range);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }
    
    res.json({
      success: true,
      data,
      range
    });
  } catch (error) {
    console.error('Error fetching bus full report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bus full report',
      error: error.message
    });
  }
};

// ==========================================
// DRIVER EFFICIENCY CONTROLLERS
// ==========================================

/**
 * GET /api/fuel-efficiency/drivers
 * Get all drivers with efficiency rankings
 */
export const getDriverEfficiency = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    
    const data = await fuelEfficiencyService.getAllDriversEfficiency(range);
    
    res.json({
      success: true,
      data,
      range,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching driver efficiency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver efficiency data',
      error: error.message
    });
  }
};

/**
 * GET /api/fuel-efficiency/drivers/:driverId
 * Get single driver efficiency by ID
 */
export const getDriverEfficiencyById = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { range = 'month' } = req.query;
    
    const data = await fuelEfficiencyService.getDriverEfficiencyById(driverId, range);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    res.json({
      success: true,
      data,
      range
    });
  } catch (error) {
    console.error('Error fetching driver efficiency by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver efficiency data',
      error: error.message
    });
  }
};

/**
 * GET /api/fuel-efficiency/driver/:driverId/full-report
 * Get full driver report with buses and fuel entries
 */
export const getDriverFullReport = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { range = 'month' } = req.query;
    
    const data = await fuelEfficiencyService.getDriverFullReport(driverId, range);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    res.json({
      success: true,
      data,
      range
    });
  } catch (error) {
    console.error('Error fetching driver full report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver full report',
      error: error.message
    });
  }
};

/**
 * GET /api/fuel-efficiency/driver/:driverId/buses-operated
 * Get buses operated by a driver
 */
export const getDriverBusesOperated = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { range = 'month' } = req.query;
    
    const data = await fuelEfficiencyService.getDriverBusesOperated(driverId, range);
    
    res.json({
      success: true,
      data,
      range,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching driver buses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver buses',
      error: error.message
    });
  }
};

/**
 * GET /api/fuel-efficiency/driver/:driverId/fuel-entries
 * Get fuel entries for a driver
 */
export const getDriverFuelEntries = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { range = 'month' } = req.query;
    
    const data = await fuelEfficiencyService.getDriverFuelEntries(driverId, range);
    
    res.json({
      success: true,
      data,
      range,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching driver fuel entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver fuel entries',
      error: error.message
    });
  }
};

// ==========================================
// LEADERBOARD & ALERTS CONTROLLERS
// ==========================================

/**
 * GET /api/fuel-efficiency/leaderboard
 * Get top performing drivers
 */
export const getLeaderboard = async (req, res) => {
  try {
    const { range = 'month', limit = 10 } = req.query;
    
    const data = await fuelEfficiencyService.getLeaderboard(parseInt(limit), range);
    
    res.json({
      success: true,
      data,
      range,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

/**
 * GET /api/fuel-efficiency/alerts
 * Get efficiency alerts (low performers)
 */
export const getEfficiencyAlerts = async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    const data = await fuelEfficiencyService.getEfficiencyAlerts(range);
    
    res.json({
      success: true,
      data,
      range,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching efficiency alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch efficiency alerts',
      error: error.message
    });
  }
};

// Export as default object for compatibility
export default {
  // Bus controllers
  getBusEfficiency,
  getBusEfficiencyById,
  getBusFullReport,
  // Driver controllers
  getDriverEfficiency,
  getDriverEfficiencyById,
  getDriverFullReport,
  getDriverBusesOperated,
  getDriverFuelEntries,
  // Leaderboard & Alerts
  getLeaderboard,
  getEfficiencyAlerts
};