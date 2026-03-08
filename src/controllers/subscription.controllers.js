import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Subscription} from "../models/subscription.models.js"
import { User } from "../models/user.models.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId} = req.params

    const channel = await User.findById(channelId)

    if(!channel) {
        throw new ApiError(404, "Channel not found")
    }

if(channelId === req.user._id.toString()){
    throw new ApiError(400, "You cannot subscribe to yourself")
}

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    })

    if(existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)

        return res.status(200).json(
            new ApiResponse(200, {}, "Unsubscribed successfully")
        )
    }

    const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200, newSubscription, "Subscribed successfully")
    )
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const subscribers = await Subscription.find({
        channel: channelId
    }).populate("subscriber", "username avatar")

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {

    const subscriptions = await Subscription.find({
        subscriber: req.user._id
    }).populate("channel", "username avatar")

    return res.status(200).json(
        new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
}