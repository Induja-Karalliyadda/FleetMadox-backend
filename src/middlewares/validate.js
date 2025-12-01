// src/middlewares/validate.js
function normalizeKeys(obj = {}) {
  const out = { ...obj };
  // Allow camelCase from frontends
  if ('vehicleId' in out) { out.vehicle_id = out.vehicleId; delete out.vehicleId; }
  if ('employeeId' in out) { out.employee_id = out.employeeId; delete out.employeeId; }
  if ('startDate' in out) { out.start_date = out.startDate; delete out.startDate; }
  if ('endDate' in out) { out.end_date = out.endDate; delete out.endDate; }
  return out;
}

export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = normalizeKeys(req.body);
      req.body = schema.body.parse(req.body);
    }
    if (schema.params) req.params = schema.params.parse(req.params);
    if (schema.query)  req.query  = schema.query.parse(req.query);
    next();
  } catch (e) {
    const first = e.errors?.[0];
    // Helpful debugging while you test:
    console.error('VALIDATION_ERROR:', { issues: e.errors, body: req.body, params: req.params, query: req.query });
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: first?.message || 'Validation error',
      path: first?.path,
      issues: e.errors
    });
  }
};
