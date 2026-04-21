import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  Tweet  from "../models/tweet.models.js" 
import mongoose from "mongoose"

const getAllTweets = asyncHandler(async (req, res) => {
    const parsed = parseInt(String(req.query.limit ?? "50"), 10)
    const limit = Math.min(Number.isFinite(parsed) ? parsed : 50, 100)

    const viewerId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null

    const tweets = await Tweet.aggregate([
        { $sort: { createdAt: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: viewerId ? { $in: [viewerId, "$likes.likedBy"] } : false
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                likesCount: 1,
                isLiked: 1,
                owner: {
                    _id: 1,
                    username: 1,
                    fullname: 1,
                    avatar: 1
                }
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, tweets, "Tweets fetched successfully")
    )
})

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if(!content || content.trim()=== ""){
        throw new ApiError(400, "Tweet content is required")
    }

    const tweet = await Tweet.create({
    content,
    owner: req.user._id
    
})

return res.status(201).json(
    new ApiResponse(201, tweet, "Tweet created successfully")
)
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const ownerId = new mongoose.Types.ObjectId(userId)
    const viewerId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null

    const tweets = await Tweet.aggregate([
        { $match: { owner: ownerId } },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: viewerId ? { $in: [viewerId, "$likes.likedBy"] } : false
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                likesCount: 1,
                isLiked: 1,
                owner: {
                    _id: 1,
                    username: 1,
                    fullname: 1,
                    avatar: 1
                }
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, tweets, "User tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params
    const { content } = req.body

    const tweet = await Tweet.findById(tweetId)

    if(!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if(tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not allowed to update this tweet")
    }

    tweet.content = content
    await tweet.save()

    return res.status(200).json(
        new ApiResponse(200, tweet, "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const tweet = await Tweet.findById(tweetId)

    if(!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if(tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not allowed to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    )
})

export {
    getAllTweets,
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}