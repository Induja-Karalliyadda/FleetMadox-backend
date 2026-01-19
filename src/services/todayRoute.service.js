import {
  TodayRouteRepository,
  BusFitnessRepository,
  OdometerReadingRepository,
  FuelEntryRepository
} from '../repositories/todayRoute.repository.js';

/**
 * TodayRoute Service
 * Contains all business logic for MyTodayRoute feature
 */
class TodayRouteService {
  constructor() {
    this.todayRouteRepo = new TodayRouteRepository();
    this.busFitnessRepo = new BusFitnessRepository();
    this.odometerRepo = new OdometerReadingRepository();
    this.fuelEntryRepo = new FuelEntryRepository();
  }

  // ==================== Assignment Methods ====================

  async getTodayAssignment(driverId, date = null) {
    try {
      return await this.todayRouteRepo.getTodayAssignment(driverId, date);
    } catch (error) {
      console.error('[TodayRouteService] getTodayAssignment error:', error);
      throw error;
    }
  }

  async getActiveAssignments(driverId) {
    try {
      return await this.todayRouteRepo.getActiveAssignments(driverId);
    } catch (error) {
      console.error('[TodayRouteService] getActiveAssignments error:', error);
      throw error;
    }
  }

  // ==================== Fitness Check Methods ====================

  async getTodayFitnessCheck(assignmentId, date = null) {
    try {
      return await this.busFitnessRepo.getByAssignmentAndDate(assignmentId, date);
    } catch (error) {
      console.error('[TodayRouteService] getTodayFitnessCheck error:', error);
      throw error;
    }
  }

  async submitFitnessCheck(data) {
    if (!data.assignmentId || !data.driverId || !data.busId) {
      throw new Error('Assignment ID, Driver ID, and Bus ID are required');
    }

    const validLevels = ['full', 'adequate', 'low', 'critical'];
    if (!validLevels.includes(data.oilLevel)) {
      throw new Error(`Oil level must be one of: ${validLevels.join(', ')}`);
    }
    if (!validLevels.includes(data.waterLevel)) {
      throw new Error(`Water level must be one of: ${validLevels.join(', ')}`);
    }

    try {
      return await this.busFitnessRepo.upsert({
        assignmentId: data.assignmentId,
        driverId: data.driverId,
        busId: data.busId,
        oilLevel: data.oilLevel,
        oilChecked: data.oilChecked,
        waterLevel: data.waterLevel,
        waterChecked: data.waterChecked,
        notes: data.notes || '',
        checkDate: data.checkDate,
        submittedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('[TodayRouteService] submitFitnessCheck error:', error);
      throw error;
    }
  }

  async getFitnessHistory(busId, limit = 30) {
    try {
      return await this.busFitnessRepo.getHistoryByBus(busId, limit);
    } catch (error) {
      console.error('[TodayRouteService] getFitnessHistory error:', error);
      throw error;
    }
  }

  async getCriticalAlerts() {
    try {
      return await this.busFitnessRepo.getCriticalAlerts();
    } catch (error) {
      console.error('[TodayRouteService] getCriticalAlerts error:', error);
      throw error;
    }
  }

  // ==================== Odometer Methods ====================

  async getTodayOdometerReadings(assignmentId, date = null) {
    try {
      const readings = await this.odometerRepo.getTodayReadings(assignmentId, date);
      
      let todayDistance = 0;
      if (readings.morning && readings.evening) {
        todayDistance = parseFloat(readings.evening.readingKm) - parseFloat(readings.morning.readingKm);
      }

      return {
        morning: readings.morning,
        evening: readings.evening,
        morningSubmitted: readings.morning !== null,
        eveningSubmitted: readings.evening !== null,
        todayDistance
      };
    } catch (error) {
      console.error('[TodayRouteService] getTodayOdometerReadings error:', error);
      throw error;
    }
  }

  async getPreviousDayReadings(busId, beforeDate = null) {
    try {
      return await this.odometerRepo.getPreviousDayReadings(busId, beforeDate);
    } catch (error) {
      console.error('[TodayRouteService] getPreviousDayReadings error:', error);
      throw error;
    }
  }

  async submitOdometerReading(data) {
    if (!data.assignmentId || !data.driverId || !data.busId || !data.readingType || !data.readingKm) {
      throw new Error('Assignment ID, Driver ID, Bus ID, reading type, and reading value are required');
    }

    if (!['morning', 'evening'].includes(data.readingType)) {
      throw new Error('Reading type must be "morning" or "evening"');
    }

    try {
      const previousReading = await this.odometerRepo.getLatestReading(data.busId);
      
      if (previousReading && data.readingKm < previousReading) {
        throw new Error(`Reading (${data.readingKm} km) cannot be less than previous reading (${previousReading} km)`);
      }

      if (data.readingType === 'evening') {
        const morningReading = await this.odometerRepo.getByAssignmentTypeAndDate(
          data.assignmentId, 
          'morning', 
          data.readingDate
        );
        
        if (!morningReading) {
          throw new Error('Morning reading must be submitted before evening reading');
        }
        
        if (data.readingKm < parseFloat(morningReading.readingKm)) {
          throw new Error(`Evening reading (${data.readingKm} km) cannot be less than morning reading (${morningReading.readingKm} km)`);
        }
      }

      return await this.odometerRepo.createReading(data);
    } catch (error) {
      console.error('[TodayRouteService] submitOdometerReading error:', error);
      throw error;
    }
  }

  async getDailyDistanceSummary(busId, days = 30) {
    try {
      return await this.odometerRepo.getDailyDistanceSummary(busId, days);
    } catch (error) {
      console.error('[TodayRouteService] getDailyDistanceSummary error:', error);
      throw error;
    }
  }

  // ==================== Fuel Entry Methods ====================

  async submitFuelEntry(data) {
    if (!data.assignmentId || !data.driverId || !data.busId) {
      throw new Error('Assignment ID, Driver ID, and Bus ID are required');
    }

    if (!data.odometerAtFueling || data.odometerAtFueling <= 0) {
      throw new Error('Odometer reading must be greater than 0');
    }

    if (!data.litersFilled || data.litersFilled <= 0) {
      throw new Error('Liters filled must be greater than 0');
    }

    if (!data.pricePerLiter || data.pricePerLiter <= 0) {
      throw new Error('Price per liter must be greater than 0');
    }

    if (!data.fuelStation || data.fuelStation.trim() === '') {
      throw new Error('Fuel station is required');
    }

    try {
      const totalCost = data.totalCost || (data.litersFilled * data.pricePerLiter);

      return await this.fuelEntryRepo.createEntry({
        ...data,
        totalCost
      });
    } catch (error) {
      console.error('[TodayRouteService] submitFuelEntry error:', error);
      throw error;
    }
  }

  async getFuelEntries(busId, limit = 50) {
    try {
      return await this.fuelEntryRepo.getByBus(busId, limit);
    } catch (error) {
      console.error('[TodayRouteService] getFuelEntries error:', error);
      throw error;
    }
  }

  async getDriverFuelEntries(driverId, limit = 50) {
    try {
      return await this.fuelEntryRepo.getByDriver(driverId, limit);
    } catch (error) {
      console.error('[TodayRouteService] getDriverFuelEntries error:', error);
      throw error;
    }
  }

  async getFuelEfficiencyReport(busId, limit = 50) {
    try {
      const entries = await this.fuelEntryRepo.getByBus(busId, limit);
      
      if (entries.length < 2) {
        return {
          hasData: false,
          message: 'Need at least 2 fuel entries to calculate efficiency'
        };
      }

      const sortedEntries = [...entries].sort((a, b) => 
        parseFloat(a.odometerAtFueling) - parseFloat(b.odometerAtFueling)
      );

      const efficiencyData = [];
      for (let i = 1; i < sortedEntries.length; i++) {
        const distanceTraveled = parseFloat(sortedEntries[i].odometerAtFueling) - parseFloat(sortedEntries[i - 1].odometerAtFueling);
        const litersFilled = parseFloat(sortedEntries[i].litersFilled);
        
        if (distanceTraveled > 0 && litersFilled > 0) {
          const kmPerLiter = distanceTraveled / litersFilled;
          const costPerKm = parseFloat(sortedEntries[i].totalCost) / distanceTraveled;

          efficiencyData.push({
            ...sortedEntries[i],
            distanceTraveled,
            kmPerLiter: parseFloat(kmPerLiter.toFixed(2)),
            costPerKm: parseFloat(costPerKm.toFixed(2))
          });
        }
      }

      if (efficiencyData.length === 0) {
        return {
          hasData: false,
          message: 'Not enough valid data to calculate efficiency'
        };
      }

      const totalDistance = parseFloat(sortedEntries[sortedEntries.length - 1].odometerAtFueling) - parseFloat(sortedEntries[0].odometerAtFueling);
      const totalLiters = entries.slice(1).reduce((sum, entry) => sum + parseFloat(entry.litersFilled), 0);
      const totalCost = entries.slice(1).reduce((sum, entry) => sum + parseFloat(entry.totalCost), 0);

      const avgKmPerLiter = totalDistance / totalLiters;
      const avgCostPerKm = totalCost / totalDistance;
      const avgCostPerDay = totalCost / efficiencyData.length;
      const avgLitersPerDay = totalLiters / efficiencyData.length;
      const avgDistancePerDay = totalDistance / efficiencyData.length;

      const efficiencyValues = efficiencyData.map(e => e.kmPerLiter);
      const bestEfficiency = Math.max(...efficiencyValues);
      const worstEfficiency = Math.min(...efficiencyValues);

      const projectedWeeklyCost = avgCostPerDay * 7;
      const projectedMonthlyCost = avgCostPerDay * 30;
      const projectedWeeklyLiters = avgLitersPerDay * 7;
      const projectedMonthlyLiters = avgLitersPerDay * 30;

      return {
        hasData: true,
        efficiencyData,
        totalDistance,
        totalLiters,
        totalCost,
        avgKmPerLiter: parseFloat(avgKmPerLiter.toFixed(2)),
        avgCostPerKm: parseFloat(avgCostPerKm.toFixed(2)),
        avgCostPerDay: parseFloat(avgCostPerDay.toFixed(2)),
        avgLitersPerDay: parseFloat(avgLitersPerDay.toFixed(2)),
        avgDistancePerDay: parseFloat(avgDistancePerDay.toFixed(2)),
        bestEfficiency: parseFloat(bestEfficiency.toFixed(2)),
        worstEfficiency: parseFloat(worstEfficiency.toFixed(2)),
        projectedWeeklyCost: parseFloat(projectedWeeklyCost.toFixed(2)),
        projectedMonthlyCost: parseFloat(projectedMonthlyCost.toFixed(2)),
        projectedWeeklyLiters: parseFloat(projectedWeeklyLiters.toFixed(2)),
        projectedMonthlyLiters: parseFloat(projectedMonthlyLiters.toFixed(2)),
        numberOfRecords: efficiencyData.length
      };
    } catch (error) {
      console.error('[TodayRouteService] getFuelEfficiencyReport error:', error);
      throw error;
    }
  }

  async getFuelCostSummary(busId, startDate, endDate) {
    try {
      return await this.fuelEntryRepo.getTotalCostByDateRange(busId, startDate, endDate);
    } catch (error) {
      console.error('[TodayRouteService] getFuelCostSummary error:', error);
      throw error;
    }
  }

  // ==================== Dashboard Methods ====================

  async getDashboardData(driverId, date = null) {
    try {
      const assignment = await this.getTodayAssignment(driverId, date);
      
      if (!assignment) {
        return {
          hasAssignment: false,
          message: 'No active assignment for today'
        };
      }

      // Get all related data in parallel with error handling
      const [
        fitnessCheck,
        odometerReadings,
        previousDayReadings,
        fuelEntries,
        fuelEfficiencyReport
      ] = await Promise.all([
        this.getTodayFitnessCheck(assignment.assignmentId, date).catch(() => null),
        this.getTodayOdometerReadings(assignment.assignmentId, date).catch(() => ({
          morning: null,
          evening: null,
          morningSubmitted: false,
          eveningSubmitted: false,
          todayDistance: 0
        })),
        this.getPreviousDayReadings(assignment.vehicleId, date).catch(() => null),
        this.getFuelEntries(assignment.vehicleId, 10).catch(() => []),
        this.getFuelEfficiencyReport(assignment.vehicleId, 20).catch(() => ({ hasData: false }))
      ]);

      return {
        hasAssignment: true,
        assignment,
        fitnessCheck,
        odometer: {
          ...odometerReadings,
          previousDay: previousDayReadings
        },
        fuel: {
          recentEntries: fuelEntries,
          efficiencyReport: fuelEfficiencyReport
        }
      };
    } catch (error) {
      console.error('[TodayRouteService] getDashboardData error:', error);
      throw error;
    }
  }

  async getQuickStats(driverId, date = null) {
    try {
      const assignment = await this.getTodayAssignment(driverId, date);
      
      if (!assignment) {
        return null;
      }

      const [fitnessCheck, odometerReadings, efficiencyReport] = await Promise.all([
        this.getTodayFitnessCheck(assignment.assignmentId, date).catch(() => null),
        this.getTodayOdometerReadings(assignment.assignmentId, date).catch(() => ({ todayDistance: 0 })),
        this.getFuelEfficiencyReport(assignment.vehicleId, 20).catch(() => ({ hasData: false }))
      ]);

      return {
        fitnessStatus: fitnessCheck?.submittedAt ? 'completed' : 'pending',
        oilLevel: fitnessCheck?.oilLevel || 'N/A',
        waterLevel: fitnessCheck?.waterLevel || 'N/A',
        todayDistance: odometerReadings.todayDistance || 0,
        avgEfficiency: efficiencyReport.hasData ? efficiencyReport.avgKmPerLiter : null,
        avgCostPerKm: efficiencyReport.hasData ? efficiencyReport.avgCostPerKm : null
      };
    } catch (error) {
      console.error('[TodayRouteService] getQuickStats error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new TodayRouteService();
