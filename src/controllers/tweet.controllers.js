import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.models.js" 

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

    const tweets = await Tweet.find({
        owner: userId
    }).sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(200, tweets, "User tweets fetched successfully")
    )
})

const updateTweets = asyncHandler(async (req, res) => {

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
    createTweet,
    getUserTweets,
    updateTweets,
    deleteTweet
}