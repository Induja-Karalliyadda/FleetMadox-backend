/**
 * Fuel Efficiency Service
 * Business logic for fuel efficiency data
 * File: services/Fuelefficiency.service.js
 */

import * as fuelEfficiencyRepository from '../repositories/Fuelefficiency.repository.js';

// ==========================================
// HELPER: Calculate Rating from Efficiency
// ==========================================
const calculateRating = (avgKmPerLiter) => {
  const efficiency = parseFloat(avgKmPerLiter) || 0;
  if (efficiency >= 5.0) return 5.0;
  if (efficiency >= 4.5) return 4.5;
  if (efficiency >= 4.0) return 4.0;
  if (efficiency >= 3.5) return 3.5;
  if (efficiency >= 3.0) return 3.0;
  if (efficiency > 0) return Math.max(1.0, efficiency);
  return 0;
};

// ==========================================
// HELPER: Get Efficiency Status
// ==========================================
const getEfficiencyStatus = (avgKmPerLiter) => {
  const efficiency = parseFloat(avgKmPerLiter) || 0;
  if (efficiency >= 4.5) return 'excellent';
  if (efficiency >= 4.0) return 'good';
  if (efficiency >= 3.5) return 'average';
  if (efficiency >= 3.0) return 'below_average';
  if (efficiency > 0) return 'poor';
  return 'no_data';
};

// ==========================================
// HELPER: Normalize Bus Data
// ==========================================
const normalizeBusData = (bus) => ({
  busId: bus.busId,
  regNumber: bus.regNumber || 'N/A',
  model: bus.model || 'N/A',
  brand: bus.brand || null,
  year: bus.year || null,
  isActive: bus.isActive,
  totalKm: parseInt(bus.totalKm) || 0,
  totalFuel: parseFloat(bus.totalFuel) || 0,
  totalCost: parseFloat(bus.totalCost) || 0,
  trips: parseInt(bus.trips) || 0,
  avgKmPerLiter: parseFloat(bus.avgKmPerLiter) || 0,
  status: getEfficiencyStatus(bus.avgKmPerLiter)
});

// ==========================================
// HELPER: Normalize Driver Data
// ==========================================
const normalizeDriverData = (driver) => {
  const avgKmPerLiter = parseFloat(driver.avgKmPerLiter) || 0;
  return {
    driverId: driver.driverId,
    name: driver.name || 'N/A',
    nic: driver.nic || 'N/A',
    phone: driver.phone || 'N/A',
    licenseNo: driver.licenseNo || driver.employeeNo || 'N/A',
    joinDate: driver.joinDate || null,
    totalKm: parseInt(driver.totalKm) || 0,
    totalFuel: parseFloat(driver.totalFuel) || 0,
    totalCost: parseFloat(driver.totalCost) || 0,
    trips: parseInt(driver.trips) || 0,
    busCount: parseInt(driver.busCount) || 0,
    avgKmPerLiter: avgKmPerLiter,
    rating: calculateRating(avgKmPerLiter),
    status: getEfficiencyStatus(avgKmPerLiter)
  };
};

// ==========================================
// HELPER: Normalize Fuel Entry
// ==========================================
const normalizeFuelEntry = (entry) => ({
  id: entry.id,
  date: entry.date,
  driverId: entry.driverId || null,
  driverName: entry.driverName || 'N/A',
  driverEmployeeNo: entry.driverEmployeeNo || null,
  busId: entry.busId || null,
  busRegNumber: entry.busRegNumber || 'N/A',
  busModel: entry.busModel || null,
  startOdometer: parseInt(entry.startOdometer) || 0,
  endOdometer: parseInt(entry.endOdometer) || 0,
  kmTraveled: parseInt(entry.kmTraveled) || 0,
  fuelLiters: parseFloat(entry.fuelLiters) || 0,
  fuelCost: parseFloat(entry.fuelCost) || 0,
  efficiency: parseFloat(entry.efficiency) || 0,
  station: entry.station || 'N/A',
  route: entry.route || null,
  createdAt: entry.createdAt || null
});

// ==========================================
// HELPER: Add Rankings to Data
// ==========================================
const addRankings = (data, efficiencyField = 'avgKmPerLiter') => {
  // Separate items with and without data
  const withData = data.filter(item => parseFloat(item[efficiencyField]) > 0);
  const withoutData = data.filter(item => parseFloat(item[efficiencyField]) <= 0);
  
  // Sort by efficiency descending
  withData.sort((a, b) => parseFloat(b[efficiencyField]) - parseFloat(a[efficiencyField]));
  
  // Add ranks
  const rankedData = withData.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
  
  // Items without data have no rank
  const unrankedData = withoutData.map(item => ({
    ...item,
    rank: null
  }));
  
  return [...rankedData, ...unrankedData];
};

// ==========================================
// BUS EFFICIENCY SERVICES
// ==========================================

/**
 * Get all buses with efficiency rankings
 */
export const getAllBusesEfficiency = async (range = 'month') => {
  const buses = await fuelEfficiencyRepository.findAllBusesEfficiency(range);
  const normalizedBuses = buses.map(normalizeBusData);
  return addRankings(normalizedBuses);
};

/**
 * Get single bus efficiency by ID
 */
export const getBusEfficiencyById = async (busId, range = 'month') => {
  const bus = await fuelEfficiencyRepository.findBusEfficiencyById(busId, range);
  if (!bus) return null;
  return normalizeBusData(bus);
};

/**
 * Get full bus report with drivers and fuel entries
 */
export const getBusFullReport = async (busId, range = 'month') => {
  // Get bus basic info
  const bus = await fuelEfficiencyRepository.findBusEfficiencyById(busId, range);
  if (!bus) return null;
  
  // Get drivers who operated this bus
  const drivers = await fuelEfficiencyRepository.findDriversByBusId(busId, range);
  
  // Get all fuel entries for this bus
  const fuelEntries = await fuelEfficiencyRepository.findFuelEntriesByBusId(busId, range);
  
  // Normalize and combine data
  const busData = normalizeBusData(bus);
  
  return {
    ...busData,
    driversOperated: drivers.map(driver => ({
      driverId: driver.driverId,
      name: driver.name || 'N/A',
      employeeNo: driver.employeeNo || 'N/A',
      phone: driver.phone || 'N/A',
      nic: driver.nic || 'N/A',
      kmDriven: parseInt(driver.kmDriven) || 0,
      fuelUsed: parseFloat(driver.fuelUsed) || 0,
      fuelCost: parseFloat(driver.fuelCost) || 0,
      trips: parseInt(driver.trips) || 0,
      avgEfficiency: parseFloat(driver.avgEfficiency) || 0
    })),
    fuelEntries: fuelEntries.map(normalizeFuelEntry)
  };
};

// ==========================================
// DRIVER EFFICIENCY SERVICES
// ==========================================

/**
 * Get all drivers with efficiency rankings
 */
export const getAllDriversEfficiency = async (range = 'month') => {
  const drivers = await fuelEfficiencyRepository.findAllDriversEfficiency(range);
  const normalizedDrivers = drivers.map(normalizeDriverData);
  const rankedDrivers = addRankings(normalizedDrivers);
  
  // Add empty busesOperated array for compatibility
  return rankedDrivers.map(driver => ({
    ...driver,
    busesOperated: []
  }));
};

/**
 * Get single driver efficiency by ID
 */
export const getDriverEfficiencyById = async (driverId, range = 'month') => {
  const driver = await fuelEfficiencyRepository.findDriverEfficiencyById(driverId, range);
  if (!driver) return null;
  return normalizeDriverData(driver);
};

/**
 * Get full driver report with buses and fuel entries
 */
export const getDriverFullReport = async (driverId, range = 'month') => {
  // Get driver basic info
  const driver = await fuelEfficiencyRepository.findDriverEfficiencyById(driverId, range);
  if (!driver) return null;
  
  // Get buses operated by this driver
  const buses = await fuelEfficiencyRepository.findBusesByDriverId(driverId, range);
  
  // Get all fuel entries for this driver
  const fuelEntries = await fuelEfficiencyRepository.findFuelEntriesByDriverId(driverId, range);
  
  // Normalize and combine data
  const driverData = normalizeDriverData(driver);
  
  return {
    ...driverData,
    busesOperated: buses.map(bus => ({
      busId: bus.busId,
      regNumber: bus.regNumber || 'N/A',
      model: bus.model || 'N/A',
      brand: bus.brand || null,
      year: bus.year || null,
      kmDriven: parseInt(bus.kmDriven) || 0,
      fuelUsed: parseFloat(bus.fuelUsed) || 0,
      fuelCost: parseFloat(bus.fuelCost) || 0,
      trips: parseInt(bus.trips) || 0,
      avgEfficiency: parseFloat(bus.avgEfficiency) || 0
    })),
    fuelEntries: fuelEntries.map(normalizeFuelEntry)
  };
};

/**
 * Get buses operated by a driver
 */
export const getDriverBusesOperated = async (driverId, range = 'month') => {
  const buses = await fuelEfficiencyRepository.findBusesByDriverId(driverId, range);
  return buses.map(bus => ({
    busId: bus.busId,
    regNumber: bus.regNumber || 'N/A',
    model: bus.model || 'N/A',
    kmDriven: parseInt(bus.kmDriven) || 0,
    fuelUsed: parseFloat(bus.fuelUsed) || 0,
    trips: parseInt(bus.trips) || 0,
    avgEfficiency: parseFloat(bus.avgEfficiency) || 0
  }));
};

/**
 * Get fuel entries for a driver
 */
export const getDriverFuelEntries = async (driverId, range = 'month') => {
  const entries = await fuelEfficiencyRepository.findFuelEntriesByDriverId(driverId, range);
  return entries.map(normalizeFuelEntry);
};

// ==========================================
// LEADERBOARD & ALERTS SERVICES
// ==========================================

/**
 * Get leaderboard (top performers)
 */
export const getLeaderboard = async (limit = 10, range = 'month') => {
  const topDrivers = await fuelEfficiencyRepository.findTopDrivers(limit, range);
  
  return topDrivers.map((driver, index) => ({
    rank: index + 1,
    driverId: driver.driverId,
    name: driver.name || 'N/A',
    employeeNo: driver.employeeNo || 'N/A',
    phone: driver.phone || 'N/A',
    totalKm: parseInt(driver.totalKm) || 0,
    totalFuel: parseFloat(driver.totalFuel) || 0,
    totalCost: parseFloat(driver.totalCost) || 0,
    trips: parseInt(driver.trips) || 0,
    busCount: parseInt(driver.busCount) || 0,
    avgKmPerLiter: parseFloat(driver.avgKmPerLiter) || 0,
    rating: calculateRating(driver.avgKmPerLiter),
    status: getEfficiencyStatus(driver.avgKmPerLiter)
  }));
};

/**
 * Get efficiency alerts (low performers)
 */
export const getEfficiencyAlerts = async (range = 'week') => {
  const threshold = 3.0; // km/L threshold for alerts
  
  // Get low efficiency buses
  const lowEfficiencyBuses = await fuelEfficiencyRepository.findLowEfficiencyBuses(threshold, range);
  
  // Get low efficiency drivers
  const lowEfficiencyDrivers = await fuelEfficiencyRepository.findLowEfficiencyDrivers(threshold, range);
  
  // Combine and format alerts
  const busAlerts = lowEfficiencyBuses.map(bus => ({
    type: 'bus',
    entityId: bus.busId,
    name: bus.regNumber || 'N/A',
    model: bus.model || 'N/A',
    efficiency: parseFloat(bus.efficiency) || 0,
    totalKm: parseInt(bus.totalKm) || 0,
    totalFuel: parseFloat(bus.totalFuel) || 0,
    trips: parseInt(bus.trips) || 0,
    message: 'Low fuel efficiency detected',
    severity: parseFloat(bus.efficiency) < 2.5 ? 'critical' : 'warning'
  }));
  
  const driverAlerts = lowEfficiencyDrivers.map(driver => ({
    type: 'driver',
    entityId: driver.driverId,
    name: driver.name || 'N/A',
    employeeNo: driver.employeeNo || 'N/A',
    efficiency: parseFloat(driver.efficiency) || 0,
    totalKm: parseInt(driver.totalKm) || 0,
    totalFuel: parseFloat(driver.totalFuel) || 0,
    trips: parseInt(driver.trips) || 0,
    message: 'Below average fuel efficiency',
    severity: parseFloat(driver.efficiency) < 2.5 ? 'critical' : 'warning'
  }));
  
  // Sort all alerts by efficiency (lowest first)
  return [...busAlerts, ...driverAlerts].sort((a, b) => a.efficiency - b.efficiency);
};

// Export all functions
export default {
  // Bus services
  getAllBusesEfficiency,
  getBusEfficiencyById,
  getBusFullReport,
  // Driver services
  getAllDriversEfficiency,
  getDriverEfficiencyById,
  getDriverFullReport,
  getDriverBusesOperated,
  getDriverFuelEntries,
  // Leaderboard & Alerts
  getLeaderboard,
  getEfficiencyAlerts
};