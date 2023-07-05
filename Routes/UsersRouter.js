import express from "express";
import { registerUser, loginUser, updatedUser, deleteUserProfile, changePassword, getLikedMovies, addLikedMovies, deleteLikedMovies, removeLikedMovies, getUsers, deleteUser } from "../Controllers/UserController.js";
import { protect, admin } from "../middlewares/Auth.js";

const router = express.Router()

// Public routes
router.post("/", registerUser);
router.post("/login", loginUser);

// Private routes
router.put("/", protect, updatedUser)
router.delete("/", protect, deleteUserProfile)
router.put("/password", protect, changePassword)

router.get("/favorites", protect, getLikedMovies)
router.post("/favorites", protect, addLikedMovies)
router.delete("/favorites", protect, deleteLikedMovies)
router.put("/favorites", protect, removeLikedMovies)

// Admin routes
router.get("/", protect, admin, getUsers)
router.put("/remove", protect, admin, deleteUser)

export default router
