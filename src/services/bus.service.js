import { listBuses, findBusById, createBus, updateBus, deleteBus } from '../repositories/bus.repository.js';

export async function getAllBuses() {
  return listBuses();
}

export async function getBus(id) {
  const bus = await findBusById(id);
  if (!bus) throw Object.assign(new Error('Bus not found'), { status: 404 });
  return bus;
}

export async function addBus(dto) {
  return createBus(dto);
}

export async function modifyBus(id, dto) {
  const existing = await findBusById(id);
  if (!existing) throw Object.assign(new Error('Bus not found'), { status: 404 });
  return updateBus(id, dto);
}


export async function removeBus(id) {
  const deleted = await deleteBus(id);
  if (!deleted) throw Object.assign(new Error('Bus not found'), { status: 404 });
  return { message: 'Bus deleted successfully' };
}
