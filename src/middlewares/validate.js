export const validate = (schema) => (req, res, next) => {
try {
if (schema.body) schema.body.parse(req.body);
if (schema.params) schema.params.parse(req.params);
if (schema.query) schema.query.parse(req.query);
next();
} catch (e) {
return res.status(400).json({ message: e.errors?.[0]?.message || 'Validation error' });
}
};