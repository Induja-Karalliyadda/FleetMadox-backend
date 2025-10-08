import express from "express";
import * as staffController from "../controllers/staff.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, staffController.getAllStaff);
router.get("/next-employee-number", authenticate, staffController.getNextEmployeeNumber);
router.post("/", authenticate, staffController.addStaff);
router.put("/:id", authenticate, staffController.updateStaff);
router.delete("/:id", authenticate, staffController.deleteStaff);

export default router;

