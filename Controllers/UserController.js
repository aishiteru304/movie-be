import asyncHandler from "express-async-handler"
import User from '../Models/UserModel.js'
import bcrypt from 'bcryptjs'
import { generateToken } from '../middlewares/Auth.js'

// USER
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, image, password } = req.body
    try {
        const userExists = await User.findOne({ email })

        if (userExists) {
            res.status(400)
            throw new Error("User already exists")
        }

        // Hash Password 
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //  Create user in DB
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            image,
        })

        // if user created successfully send user to client
        if (user) res.status(201).json({ message: "User created successfully" })
        else {
            res.status(400);
            throw new Error("Invalid user data")
        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    try {
        // Find user in DB
        const user = await User.findOne({ email })

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                image: user.image,
                isAdmin: user.isAdmin,
                token: generateToken(user._id)
            })
        }
        else {
            res.status(401)
            throw new Error("Invalid email or password.")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const updatedUser = asyncHandler(async (req, res) => {
    const { fullName, image } = req.body
    try {
        // Find user in DB
        const user = await User.findById(req.user._id)

        if (user) {
            user.fullName = fullName || user.fullName
            user.image = image || user.image
            const updatedUser = await user.save()

            res.json({
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                image: updatedUser.image,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id)
            })
        }
        else {
            res.status(401)
            throw new Error("User not found")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const deleteUserProfile = asyncHandler(async (req, res) => {
    try {
        // Find user in DB
        const user = await User.findById(req.user._id)

        if (user) {
            if (user.isAdmin) {
                res.status(400)
                throw new Error("Can't delete admin user")
            }
            // await user.remove()
            await User.deleteOne({ _id: req.user._id })
            res.json({ message: "User deleted successfully" })
        }
        else {
            res.status(401)
            throw new Error("User not found")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    try {
        // Find user in DB
        const user = await User.findById(req.user._id)

        if (user && (await bcrypt.compare(oldPassword, user.password))) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(newPassword, salt)
            user.password = hashedPassword
            await user.save()

            res.json({
                message: "Password changed"
            })
        }
        else {
            res.status(401)
            throw new Error("Invalid old Password")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const getLikedMovies = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("likedMovies")
        if (user) {
            res.json(user.likedMovies)
        }
        else {
            res.status(404)
            throw new Error("User not found")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const addLikedMovies = asyncHandler(async (req, res) => {
    const { movieId } = req.body
    try {
        const user = await User.findById(req.user._id)
        if (user) {
            if (user.likedMovies.includes(movieId)) {
                res.status(400)
                throw new Error("Movie already liked")
            }

            user.likedMovies.push(movieId)
            await user.save()
            // res.json(user.likedMovies)
            const newUser = await User.findById(req.user._id).populate("likedMovies")
            if (newUser) {
                res.json(newUser.likedMovies)
            }
            else {
                res.status(404)
                throw new Error("User not found")
            }
        }
        else {
            res.status(404)
            throw new Error("User not found")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const removeLikedMovies = asyncHandler(async (req, res) => {
    const { movieId } = req.body
    try {
        const user = await User.findById(req.user._id)
        if (user) {
            await User.updateOne(
                { _id: req.user._id },
                { $pull: { likedMovies: { $in: [movieId] } } }
            );
            const newUser = await User.findById(req.user._id).populate("likedMovies")
            res.json(newUser.likedMovies)
        }
        else {
            res.status(404)
            throw new Error("User not found")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const deleteLikedMovies = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        if (user) {
            user.likedMovies = []
            await user.save()
            res.json(user.likedMovies)
        }
        else {
            res.status(404)
            throw new Error("User not found")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// ADMIN

const getUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({})
        res.json({ users })
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body
    try {
        // Find user in DB
        const user = await User.findById(id)

        if (user) {
            if (user.isAdmin) {
                res.status(400)
                throw new Error("Can't delete admin user")
            }
            // await user.remove()
            await User.deleteOne({ _id: id })
            const users = await User.find({})
            res.json({ users })
        }
        else {
            res.status(401)
            throw new Error("User not found")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

export {
    registerUser,
    loginUser,
    updatedUser,
    deleteUserProfile,
    changePassword,
    getLikedMovies,
    addLikedMovies,
    deleteLikedMovies,
    removeLikedMovies,
    getUsers,
    deleteUser,
}

