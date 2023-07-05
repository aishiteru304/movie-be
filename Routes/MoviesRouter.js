import express from "express";
import { createMovie, createMovieReview, removeMovie, getMovies, importMovie } from "../Controllers/MovieController.js";
import { protect, admin } from "../middlewares/Auth.js";

const router = express.Router()

// Public routes
router.get("/import", importMovie);
router.get("/", getMovies);
router.post("/reviews", protect, createMovieReview);

// Admin routes
router.post("/", protect, admin, createMovie);
router.put("/", protect, admin, removeMovie);

export default router
