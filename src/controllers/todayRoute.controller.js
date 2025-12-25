import todayRouteService from '../services/todayRoute.service.js';

/**
 * TodayRoute Controller
 * Handles HTTP requests for the MyTodayRoute feature
 */
class TodayRouteController {
  
  // ==================== Dashboard ====================

  async getDashboard(req, res, next) {
    try {
      const driverId = req.user.id;
      const { date } = req.query;

      console.log(`[TodayRoute] Getting dashboard for driver: ${driverId}`);

      const dashboardData = await todayRouteService.getDashboardData(driverId, date);

      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('[TodayRoute] Dashboard error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load dashboard'
      });
    }
  }

  async getTodayAssignment(req, res, next) {
    try {
      const driverId = req.user.id;
      const { date } = req.query;

      console.log(`[TodayRoute] Getting assignment for driver: ${driverId}`);

      const assignment = await todayRouteService.getTodayAssignment(driverId, date);

      if (!assignment) {
        return res.status(200).json({
          success: true,
          data: null,
          message: 'No active assignment found for today'
        });
      }

      res.status(200).json({
        success: true,
        data: assignment
      });
    } catch (error) {
      console.error('[TodayRoute] Assignment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load assignment'
      });
    }
  }

  async getActiveAssignments(req, res, next) {
    try {
      const driverId = req.user.id;
      const assignments = await todayRouteService.getActiveAssignments(driverId);

      res.status(200).json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('[TodayRoute] Active assignments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load active assignments'
      });
    }
  }

  // ==================== Fitness Check ====================

  async getFitnessCheck(req, res, next) {
    try {
      const driverId = req.user.id;
      const { date, assignmentId } = req.query;

      let targetAssignmentId = assignmentId;
      if (!targetAssignmentId) {
        const assignment = await todayRouteService.getTodayAssignment(driverId, date);
        if (!assignment) {
          return res.status(200).json({
            success: true,
            data: null,
            message: 'No active assignment found'
          });
        }
        targetAssignmentId = assignment.assignmentId;
      }

      const fitnessCheck = await todayRouteService.getTodayFitnessCheck(targetAssignmentId, date);

      res.status(200).json({
        success: true,
        data: fitnessCheck
      });
    } catch (error) {
      console.error('[TodayRoute] Fitness check error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load fitness check'
      });
    }
  }

  async submitFitnessCheck(req, res, next) {
    try {
      const driverId = req.user.id;
      const { 
        assignmentId, 
        busId, 
        oilLevel, 
        oilChecked, 
        waterLevel, 
        waterChecked, 
        notes,
        checkDate 
      } = req.body;

      console.log(`[TodayRoute] Submitting fitness check for driver: ${driverId}`);

      let targetAssignmentId = assignmentId;
      let targetBusId = busId;
      
      if (!targetAssignmentId) {
        const assignment = await todayRouteService.getTodayAssignment(driverId);
        if (!assignment) {
          return res.status(404).json({
            success: false,
            message: 'No active assignment found'
          });
        }
        targetAssignmentId = assignment.assignmentId;
        targetBusId = targetBusId || assignment.vehicleId;
      }

      const fitnessCheck = await todayRouteService.submitFitnessCheck({
        assignmentId: targetAssignmentId,
        driverId,
        busId: targetBusId,
        oilLevel,
        oilChecked,
        waterLevel,
        waterChecked,
        notes,
        checkDate
      });

      res.status(201).json({
        success: true,
        message: 'Fitness check submitted successfully',
        data: fitnessCheck
      });
    } catch (error) {
      console.error('[TodayRoute] Fitness submit error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to submit fitness check'
      });
    }
  }

  async getFitnessHistory(req, res, next) {
    try {
      const { busId, limit = 30 } = req.query;

      if (!busId) {
        return res.status(400).json({
          success: false,
          message: 'Bus ID is required'
        });
      }

      const history = await todayRouteService.getFitnessHistory(parseInt(busId), parseInt(limit));

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('[TodayRoute] Fitness history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load fitness history'
      });
    }
  }

  // ==================== Odometer ====================

  async getOdometerReadings(req, res, next) {
    try {
      const driverId = req.user.id;
      const { date, assignmentId } = req.query;

      let targetAssignmentId = assignmentId;
      let busId;
      
      if (!targetAssignmentId) {
        const assignment = await todayRouteService.getTodayAssignment(driverId, date);
        if (!assignment) {
          return res.status(200).json({
            success: true,
            data: {
              morning: null,
              evening: null,
              morningSubmitted: false,
              eveningSubmitted: false,
              todayDistance: 0,
              previousDay: null
            }
          });
        }
        targetAssignmentId = assignment.assignmentId;
        busId = assignment.vehicleId;
      }

      const [readings, previousDay] = await Promise.all([
        todayRouteService.getTodayOdometerReadings(targetAssignmentId, date),
        busId ? todayRouteService.getPreviousDayReadings(busId, date) : null
      ]);

      res.status(200).json({
        success: true,
        data: {
          ...readings,
          previousDay
        }
      });
    } catch (error) {
      console.error('[TodayRoute] Odometer readings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load odometer readings'
      });
    }
  }

  async submitOdometerReading(req, res, next) {
    try {
      const driverId = req.user.id;
      const { 
        assignmentId, 
        busId, 
        readingType, 
        readingKm, 
        readingDate 
      } = req.body;

      console.log(`[TodayRoute] Submitting ${readingType} odometer for driver: ${driverId}`);

      if (!['morning', 'evening'].includes(readingType)) {
        return res.status(400).json({
          success: false,
          message: 'Reading type must be "morning" or "evening"'
        });
      }

      let targetAssignmentId = assignmentId;
      let targetBusId = busId;
      
      if (!targetAssignmentId) {
        const assignment = await todayRouteService.getTodayAssignment(driverId);
        if (!assignment) {
          return res.status(404).json({
            success: false,
            message: 'No active assignment found'
          });
        }
        targetAssignmentId = assignment.assignmentId;
        targetBusId = targetBusId || assignment.vehicleId;
      }

      const reading = await todayRouteService.submitOdometerReading({
        assignmentId: targetAssignmentId,
        driverId,
        busId: targetBusId,
        readingType,
        readingKm: parseFloat(readingKm),
        readingDate
      });

      res.status(201).json({
        success: true,
        message: `${readingType.charAt(0).toUpperCase() + readingType.slice(1)} odometer reading submitted successfully`,
        data: reading
      });
    } catch (error) {
      console.error('[TodayRoute] Odometer submit error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to submit odometer reading'
      });
    }
  }

  async getOdometerHistory(req, res, next) {
    try {
      const { busId, days = 30 } = req.query;

      if (!busId) {
        return res.status(400).json({
          success: false,
          message: 'Bus ID is required'
        });
      }

      const history = await todayRouteService.getDailyDistanceSummary(parseInt(busId), parseInt(days));

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('[TodayRoute] Odometer history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load odometer history'
      });
    }
  }

  // ==================== Fuel ====================

  async getFuelEntries(req, res, next) {
    try {
      const driverId = req.user.id;
      const { busId, limit = 50 } = req.query;

      let targetBusId = busId;
      
      if (!targetBusId) {
        const assignment = await todayRouteService.getTodayAssignment(driverId);
        if (!assignment) {
          return res.status(200).json({
            success: true,
            data: []
          });
        }
        targetBusId = assignment.vehicleId;
      }

      const entries = await todayRouteService.getFuelEntries(parseInt(targetBusId), parseInt(limit));

      res.status(200).json({
        success: true,
        data: entries
      });
    } catch (error) {
      console.error('[TodayRoute] Fuel entries error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load fuel entries'
      });
    }
  }

  async submitFuelEntry(req, res, next) {
    try {
      const driverId = req.user.id;
      const {
        assignmentId,
        busId,
        odometerAtFueling,
        litersFilled,
        pricePerLiter,
        totalCost,
        fuelStation,
        notes,
        fuelDate
      } = req.body;

      console.log(`[TodayRoute] Submitting fuel entry for driver: ${driverId}`);

      let targetAssignmentId = assignmentId;
      let targetBusId = busId;
      
      if (!targetAssignmentId) {
        const assignment = await todayRouteService.getTodayAssignment(driverId);
        if (!assignment) {
          return res.status(404).json({
            success: false,
            message: 'No active assignment found'
          });
        }
        targetAssignmentId = assignment.assignmentId;
        targetBusId = targetBusId || assignment.vehicleId;
      }

      const fuelEntry = await todayRouteService.submitFuelEntry({
        assignmentId: targetAssignmentId,
        driverId,
        busId: targetBusId,
        odometerAtFueling: parseFloat(odometerAtFueling),
        litersFilled: parseFloat(litersFilled),
        pricePerLiter: parseFloat(pricePerLiter),
        totalCost: totalCost ? parseFloat(totalCost) : null,
        fuelStation,
        notes,
        fuelDate
      });

      res.status(201).json({
        success: true,
        message: 'Fuel entry recorded successfully',
        data: fuelEntry
      });
    } catch (error) {
      console.error('[TodayRoute] Fuel submit error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to submit fuel entry'
      });
    }
  }

  async getFuelEfficiencyReport(req, res, next) {
    try {
      const driverId = req.user.id;
      const { busId, limit = 50 } = req.query;

      let targetBusId = busId;
      
      if (!targetBusId) {
        const assignment = await todayRouteService.getTodayAssignment(driverId);
        if (!assignment) {
          return res.status(200).json({
            success: true,
            data: {
              hasData: false,
              message: 'No active assignment found'
            }
          });
        }
        targetBusId = assignment.vehicleId;
      }

      const report = await todayRouteService.getFuelEfficiencyReport(parseInt(targetBusId), parseInt(limit));

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('[TodayRoute] Efficiency report error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load efficiency report'
      });
    }
  }

  async getFuelCostSummary(req, res, next) {
    try {
      const { busId, startDate, endDate } = req.query;

      if (!busId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Bus ID, start date, and end date are required'
        });
      }

      const summary = await todayRouteService.getFuelCostSummary(
        parseInt(busId),
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('[TodayRoute] Fuel summary error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load fuel summary'
      });
    }
  }

  async getQuickStats(req, res, next) {
    try {
      const driverId = req.user.id;
      const { date } = req.query;

      const stats = await todayRouteService.getQuickStats(driverId, date);

      if (!stats) {
        return res.status(200).json({
          success: true,
          data: null,
          message: 'No active assignment found'
        });
      }

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('[TodayRoute] Quick stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load quick stats'
      });
    }
  }

  async getDriverFuelHistory(req, res, next) {
    try {
      const driverId = req.user.id;
      const { limit = 50 } = req.query;

      const entries = await todayRouteService.getDriverFuelEntries(driverId, parseInt(limit));

      res.status(200).json({
        success: true,
        data: entries
      });
    } catch (error) {
      console.error('[TodayRoute] Driver fuel history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to load driver fuel history'
      });
    }
  }
}

// Export singleton instance
export default new TodayRouteController();
