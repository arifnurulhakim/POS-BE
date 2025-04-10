import { Router } from "express";
import { ActivityLog } from "../models/ActivityLog";

const router = Router();

router.get("/test", async (req, res) => {
  await ActivityLog.create({
    userId: "test-user",
    action: "TEST_ROUTE",
    detail: { success: true }
  });

  res.json({ message: "Test route berhasil!" });
});

export default router;