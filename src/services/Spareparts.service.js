// src/services/Spareparts.service.js
import * as sparePartsRepository from '../repositories/Spareparts.repository.js';

// ==================== SPARE PART (Master) ====================

export const getAllSpareParts = async () => {
    return await sparePartsRepository.findAllSpareParts();
};

export const getSparePartById = async (id) => {
    const sparePart = await sparePartsRepository.findSparePartById(id);
    if (!sparePart) {
        const error = new Error('Spare part not found');
        error.statusCode = 404;
        throw error;
    }
    return sparePart;
};

export const createSparePart = async (data) => {
    // Validate required fields
    if (!data.part_name || data.part_name.trim() === '') {
        const error = new Error('Part name is required');
        error.statusCode = 400;
        throw error;
    }
    
    // Check if part name already exists
    const existing = await sparePartsRepository.findSparePartByName(data.part_name);
    if (existing) {
        const error = new Error('A spare part with this name already exists');
        error.statusCode = 409;
        throw error;
    }
    
    return await sparePartsRepository.createSparePart({
        part_name: data.part_name.trim(),
        description: data.description?.trim() || null
    });
};

export const updateSparePart = async (id, data) => {
    // Check if spare part exists
    const existing = await sparePartsRepository.findSparePartById(id);
    if (!existing) {
        const error = new Error('Spare part not found');
        error.statusCode = 404;
        throw error;
    }
    
    // If updating name, check for duplicates
    if (data.part_name && data.part_name !== existing.part_name) {
        const duplicate = await sparePartsRepository.findSparePartByName(data.part_name);
        if (duplicate) {
            const error = new Error('A spare part with this name already exists');
            error.statusCode = 409;
            throw error;
        }
    }
    
    return await sparePartsRepository.updateSparePart(id, data);
};

export const deleteSparePart = async (id) => {
    const existing = await sparePartsRepository.findSparePartById(id);
    if (!existing) {
        const error = new Error('Spare part not found');
        error.statusCode = 404;
        throw error;
    }
    
    return await sparePartsRepository.deleteSparePart(id);
};

// ==================== VEHICLE SPARE PART (Installations) ====================

export const getAllVehicleSpareParts = async (filters = {}) => {
    // Convert string 'true'/'false' to boolean
    if (filters.is_active !== undefined) {
        filters.is_active = filters.is_active === 'true' || filters.is_active === true;
    }
    return await sparePartsRepository.findAllVehicleSpareParts(filters);
};

export const getVehicleSparePartById = async (id) => {
    const vehicleSparePart = await sparePartsRepository.findVehicleSparePartById(id);
    if (!vehicleSparePart) {
        const error = new Error('Vehicle spare part installation not found');
        error.statusCode = 404;
        throw error;
    }
    return vehicleSparePart;
};

export const installSparePart = async (data) => {
    // Validate required fields
    const requiredFields = [
        'spare_part_id', 'bus_id', 'install_odometer', 'install_date',
        'installed_by', 'cost', 'distance_limit', 'brand', 'boundary_limit'
    ];
    
    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            const error = new Error(`${field.replace(/_/g, ' ')} is required`);
            error.statusCode = 400;
            throw error;
        }
    }
    
    // Validate numeric fields
    if (isNaN(parseFloat(data.install_odometer)) || parseFloat(data.install_odometer) < 0) {
        const error = new Error('Install odometer must be a valid positive number');
        error.statusCode = 400;
        throw error;
    }
    
    if (isNaN(parseFloat(data.cost)) || parseFloat(data.cost) < 0) {
        const error = new Error('Cost must be a valid positive number');
        error.statusCode = 400;
        throw error;
    }
    
    if (isNaN(parseFloat(data.distance_limit)) || parseFloat(data.distance_limit) <= 0) {
        const error = new Error('Distance limit must be a valid positive number');
        error.statusCode = 400;
        throw error;
    }
    
    if (isNaN(parseFloat(data.boundary_limit)) || parseFloat(data.boundary_limit) < 0) {
        const error = new Error('Boundary limit must be a valid positive number');
        error.statusCode = 400;
        throw error;
    }
    
    if (parseFloat(data.boundary_limit) >= parseFloat(data.distance_limit)) {
        const error = new Error('Boundary limit must be less than distance limit');
        error.statusCode = 400;
        throw error;
    }
    
    // Create the installation
    const installation = await sparePartsRepository.createVehicleSparePart(data);
    
    // Log the installation in maintenance log
    await sparePartsRepository.createMaintenanceLog({
        vehicle_spare_part_id: installation.id,
        bus_id: data.bus_id,
        odometer_at_service: data.install_odometer,
        action_taken: `Installed new ${data.brand} spare part`,
        performed_by: data.installed_by
    });
    
    return installation;
};

export const updateVehicleSparePart = async (id, data) => {
    const existing = await sparePartsRepository.findVehicleSparePartById(id);
    if (!existing) {
        const error = new Error('Vehicle spare part installation not found');
        error.statusCode = 404;
        throw error;
    }
    
    const updated = await sparePartsRepository.updateVehicleSparePart(id, data);
    
    // If deactivated (replaced), log it
    if (data.is_active === false && existing.is_active === true) {
        await sparePartsRepository.createMaintenanceLog({
            vehicle_spare_part_id: id,
            bus_id: existing.bus_id,
            odometer_at_service: existing.install_odometer,
            action_taken: 'Spare part replaced/deactivated',
            performed_by: null
        });
    }
    
    return updated;
};

export const deleteVehicleSparePart = async (id) => {
    const existing = await sparePartsRepository.findVehicleSparePartById(id);
    if (!existing) {
        const error = new Error('Vehicle spare part installation not found');
        error.statusCode = 404;
        throw error;
    }
    
    return await sparePartsRepository.deleteVehicleSparePart(id);
};

// ==================== REPLACEMENT SERVICE ====================

export const replaceSparePart = async (oldPartId, newPartData) => {
    // Get the old part
    const oldPart = await sparePartsRepository.findVehicleSparePartById(oldPartId);
    if (!oldPart) {
        const error = new Error('Original spare part installation not found');
        error.statusCode = 404;
        throw error;
    }
    
    if (!oldPart.is_active) {
        const error = new Error('This spare part has already been replaced');
        error.statusCode = 400;
        throw error;
    }
    
    // Deactivate the old part
    await sparePartsRepository.updateVehicleSparePart(oldPartId, { is_active: false });
    
    // Log the replacement
    await sparePartsRepository.createMaintenanceLog({
        vehicle_spare_part_id: oldPartId,
        bus_id: oldPart.bus_id,
        odometer_at_service: newPartData.install_odometer,
        action_taken: `Replaced ${oldPart.brand} spare part with new ${newPartData.brand}`,
        performed_by: newPartData.installed_by
    });
    
    // Install the new part
    const newPart = await installSparePart({
        ...newPartData,
        spare_part_id: oldPart.spare_part_id,
        bus_id: oldPart.bus_id
    });
    
    return {
        oldPart: { ...oldPart, is_active: false },
        newPart
    };
};

// ==================== ALERTS & STATUS ====================

export const getReplacementAlerts = async () => {
    return await sparePartsRepository.findPartsNeedingReplacement();
};

export const getBusSparePartStatus = async (busId) => {
    return await sparePartsRepository.findBusSparePartStatus(busId);
};

// ==================== MAINTENANCE LOGS ====================

export const getMaintenanceLogs = async (filters = {}) => {
    return await sparePartsRepository.findMaintenanceLogs(filters);
};

// ==================== ODOMETER ====================

export const getLatestOdometerByBus = async (busId) => {
    const reading = await sparePartsRepository.findLatestOdometerByBus(busId);
    if (!reading) {
        return { reading_km: 0, message: 'No odometer reading found' };
    }
    return reading;
};