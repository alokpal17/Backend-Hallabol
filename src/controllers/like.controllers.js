import { Video } from "../models/video.models.js"
import { Like } from "../models/like.models.js"
import Tweet from "../models/tweet.models.js"
import { Comment } from "../models/comment.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const toggleLikeVideo = asyncHandler(async (req, res) => {
    

    const {videoId} = req.params

    const video = await Video.findById(videoId)
    
    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    
    const existingLike = await Like.findOne({
            video: videoId,
            likedBy: req.user._id
        })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, {}, "Video unliked successfully")
        )
    }
    
    const newLike = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, newLike, "Video liked successfully")
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    const comment = await Comment.findById(commentId)

    if(!comment) {
        throw new ApiError(404, "COmment not found")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (existingLike) {

        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(
            new ApiResponse(200, {}, "Comment unliked successfully")
        )
    }

    const newLike = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, newLike, "Comment liked successfully")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    const tweet = await Tweet.findById(tweetId)

    if(!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if(existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(
            new ApiResponse(200, {}, "Tweet unliked successfully")
        )
    }

    const newLike = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200, newLike, "Tweet liked successfully")
    )

})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedvideos = await Like.find({
        likedBy: req.user._id,
        video: { $ne: null}

    }).populate("video")

    return res.status(200).json(
        new ApiResponse(200, likedvideos, "Liked videos fetched successfully")
    )

})

export {
    toggleLikeVideo,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}