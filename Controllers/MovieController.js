import asyncHandler from "express-async-handler"
import Movie from '../Models/MovieModel.js'
import { data } from '../data.js'

const importMovie = asyncHandler(async (req, res) => {
    try {
        await Movie.deleteMany({})
        const movies = await Movie.insertMany(data)
        res.status(201).json(movies)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const getMovies = asyncHandler(async (req, res) => {
    try {
        const movies = await Movie.find({})
        res.json({ movies })
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

const createMovieReview = asyncHandler(async (req, res) => {
    const { rating, comment, id } = req.body
    try {
        const movie = await Movie.findById(id)
        if (movie) {
            const alreadyReviewed = movie.reviews.find(
                (r) => r.userId.toString() === req.user._id.toString()
            )
            if (alreadyReviewed) {
                res.status(400)
                throw new Error("You already reviewed this movie")
            }
            const review = {
                userName: req.user.fullName,
                userId: req.user._id,
                userImage: req.user.image,
                rating: Number(rating),
                comment,
            }
            movie.reviews.push(review)
            movie.rate = (movie.rate * movie.numberOfReviews + review.rating) / (movie.numberOfReviews + 1)
            movie.numberOfReviews += 1
            await movie.save()
            res.status(201).json(movie)
        }
        else {
            res.status(404)
            throw new Error("Movie not found")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})


// ADMIN
const createMovie = asyncHandler(async (req, res) => {
    const { name, desc, image, titleImage, category, language, year, time, casts, reviews, rate, numberOfReviews } = req.body
    try {
        //  Create user in DB
        const movie = await Movie.create({
            name,
            desc,
            image,
            titleImage,
            category,
            language,
            year: Number(year),
            time,
            casts,
            reviews,
            rate: Number(rate),
            numberOfReviews: Number(numberOfReviews),
            userId: req.user._id,
        })
        // if movie created successfully send movie to client
        if (movie) res.status(201).json({ message: "Movie created successfully" })
        else {
            res.status(400);
            throw new Error("Invalid movie data")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }

})

const removeMovie = asyncHandler(async (req, res) => {
    const { movieId } = req.body
    try {
        // Find movie in DB
        const movie = await Movie.findById(movieId)

        if (movie) {
            // await user.remove()
            await Movie.deleteOne({ _id: movieId })
            res.status(201).json({ message: "Movie deleted successfully" })
        }
        else {
            res.status(401)
            throw new Error("Movie not found")
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

export { importMovie, getMovies, createMovieReview, createMovie, removeMovie }
