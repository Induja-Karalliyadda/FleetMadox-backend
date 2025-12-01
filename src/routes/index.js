import express from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import staffRoutes from "./staff.routes.js";
import busRoutes from './bus.routes.js'; 
import assignmentsRoutes from './assignments.routes.js';
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 FleetMadox API running successfully!" });
});
router.use('/assignments', assignmentsRoutes);
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/staff", staffRoutes);
router.use('/bus', busRoutes)
export default router;

