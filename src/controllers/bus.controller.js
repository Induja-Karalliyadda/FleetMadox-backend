import { getAllBuses, getBus, addBus, modifyBus, removeBus } from '../services/bus.service.js';

export async function listBusesController(req, res, next) {
  try {
    const data = await getAllBuses();
    res.json(data);
  } catch (e) { next(e); }
}

export async function getBusController(req, res, next) {
  try {
    const bus = await getBus(Number(req.params.id));
    res.json(bus);
  } catch (e) { next(e); }
}

export async function createBusController(req, res, next) {
  try {
    const bus = await addBus(req.body);
    res.status(201).json(bus);
  } catch (e) { next(e); }
}

export async function updateBusController(req, res, next) {
  try {
    const bus = await modifyBus(Number(req.params.id), req.body);
    res.json(bus);
  } catch (e) { next(e); }
}


export async function deleteBusController(req, res, next) {
  try {
    const result = await removeBus(Number(req.params.id));
    res.json(result);
  } catch (e) { next(e); }
}
