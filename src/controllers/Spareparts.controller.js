// src/controllers/Spareparts.controller.js
import * as sparePartsService from '../services/Spareparts.service.js';

// ==================== SPARE PART (Master) ====================

export const getAllSpareParts = async (req, res, next) => {
    try {
        const spareParts = await sparePartsService.getAllSpareParts();
        res.json(spareParts);
    } catch (error) {
        next(error);
    }
};

export const getSparePartById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sparePart = await sparePartsService.getSparePartById(id);
        res.json(sparePart);
    } catch (error) {
        next(error);
    }
};

export const createSparePart = async (req, res, next) => {
    try {
        const sparePart = await sparePartsService.createSparePart(req.body);
        res.status(201).json(sparePart);
    } catch (error) {
        next(error);
    }
};

export const updateSparePart = async (req, res, next) => {
    try {
        const { id } = req.params;
        const sparePart = await sparePartsService.updateSparePart(id, req.body);
        res.json(sparePart);
    } catch (error) {
        next(error);
    }
};

export const deleteSparePart = async (req, res, next) => {
    try {
        const { id } = req.params;
        await sparePartsService.deleteSparePart(id);
        res.json({ message: 'Spare part deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// ==================== VEHICLE SPARE PART (Installations) ====================

export const getAllVehicleSpareParts = async (req, res, next) => {
    try {
        const { bus_id, is_active, spare_part_id } = req.query;
        const vehicleSpareParts = await sparePartsService.getAllVehicleSpareParts({
            bus_id,
            is_active,
            spare_part_id
        });
        res.json(vehicleSpareParts);
    } catch (error) {
        next(error);
    }
};

export const getVehicleSparePartById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vehicleSparePart = await sparePartsService.getVehicleSparePartById(id);
        res.json(vehicleSparePart);
    } catch (error) {
        next(error);
    }
};

export const installSparePart = async (req, res, next) => {
    try {
        const installation = await sparePartsService.installSparePart(req.body);
        res.status(201).json(installation);
    } catch (error) {
        next(error);
    }
};

export const updateVehicleSparePart = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vehicleSparePart = await sparePartsService.updateVehicleSparePart(id, req.body);
        res.json(vehicleSparePart);
    } catch (error) {
        next(error);
    }
};

export const deleteVehicleSparePart = async (req, res, next) => {
    try {
        const { id } = req.params;
        await sparePartsService.deleteVehicleSparePart(id);
        res.json({ message: 'Vehicle spare part installation deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// ==================== REPLACEMENT ====================

export const replaceSparePart = async (req, res, next) => {
    try {
        const { id } = req.params; // Old part ID
        const result = await sparePartsService.replaceSparePart(id, req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

// ==================== ALERTS & STATUS ====================

export const getReplacementAlerts = async (req, res, next) => {
    try {
        const alerts = await sparePartsService.getReplacementAlerts();
        res.json(alerts);
    } catch (error) {
        next(error);
    }
};

export const getBusSparePartStatus = async (req, res, next) => {
    try {
        const { busId } = req.params;
        const status = await sparePartsService.getBusSparePartStatus(busId);
        res.json(status);
    } catch (error) {
        next(error);
    }
};

// ==================== MAINTENANCE LOGS ====================

export const getMaintenanceLogs = async (req, res, next) => {
    try {
        const { bus_id } = req.query;
        const logs = await sparePartsService.getMaintenanceLogs({ bus_id });
        res.json(logs);
    } catch (error) {
        next(error);
    }
};

// ==================== ODOMETER ====================

export const getLatestOdometerByBus = async (req, res, next) => {
    try {
        const { busId } = req.params;
        const reading = await sparePartsService.getLatestOdometerByBus(busId);
        res.json(reading);
    } catch (error) {
        next(error);
    }
};