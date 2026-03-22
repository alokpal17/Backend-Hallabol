import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {Video} from "../models/video.models.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

/*
1.Get video comments
2.Add comment
3.Update comment
4.Delete comment
*/


const getVideoComments = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    // const {page = 1, limit = 10} = req.query ye string deta hai isliye parseInt karna padta hai taki number mile
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    const skip = (page - 1) * limit

    const comments = await Comment.find({video: videoId})
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1})
        .populate("owner", "username avatar")

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    )

})
const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body

    if(!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }
    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment added successfully")
    )


})

const updateComment = asyncHandler(async (req, res) => {
    /* 
    1.commentid chahiye
    2.new content chahiye
    3.comment exist karta hai ya nahi
    4.comment ka owner hai ya nahi
    5.update karna hai
    6.response dena hai
    */

    const {commentId} = req.params
    const {content} = req.body

    if(!content || content.trim()==="") {
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.findById(commentId)

    if(!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Authorization check
    if(comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment")
    }
    // 401 -> not authenticated
    // 403 -> authenticated but not authorized

    // update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {content},
        {new: true}
    )

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )


})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    const comment = await Comment.findById(commentId)

    if(!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this comment")
    }
    
    await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )

})


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}