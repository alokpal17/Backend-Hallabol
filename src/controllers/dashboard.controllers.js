import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const channelId = req.user._id

    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    })

    const totalVideos = await Video.countDocuments({
        owner: channelId
    })

    const viewsResult = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ])

    const totalViews = viewsResult[0]?.totalViews || 0

    const likesResult = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $match: {
                "video.owner": new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count: "totalLikes"
        }
    ])

    const totalLikes = likesResult[0]?.totalLikes || 0

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSubscribers,
                totalVideos,
                totalViews,
                totalLikes
            },
            "Channel stats fetched successfully"
        )
    )
})


const getChannelVideos = asyncHandler(async (req, res) => {

    const channelId = req.user._id

    const videos = await Video.find({
        owner: channelId
    }).sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Channel videos fetched successfully"
        )
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }