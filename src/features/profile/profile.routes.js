import { Router } from "express";
const profileRoutes = Router();

profileRoutes.get("/", (req, res) => {
  res.status(200).json({ message: "Profile route" });
});

export default profileRoutes;
