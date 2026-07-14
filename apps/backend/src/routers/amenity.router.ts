import express from "express";
import { DB } from "@/db";
import { Amenity } from '../entities/Amenity';
import { authenticateToken } from "@/middlewares/auth.middleware"; 

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    console.log('POST /amenity called');
  const { id, amenityName } = req.body;

  const amenity = DB.em.create(Amenity, {
    id: id,
    amenityName: amenityName,
  });

  await DB.em.persistAndFlush(amenity);

  res.status(201).json(amenity);
});

export const amenityRouter = router;
