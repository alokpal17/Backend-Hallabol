import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.models.js"
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {

    const { name, description }= req.body

    if(!name  || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    /*
    1.get playlistid and videoId
    2.find playlist
    3.owner check
    4.check video exists
    5. add video using $addToSet
    6. return updated playlist
    */

    const { playlistId, videoId } = req.params

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() != req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    }
    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId}
        },
        {new: true}
    ).populate("videos")

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Video added to playlist")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const { playlistId, videoId} = req.params
    
    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {videos: videoId}
        },
        {new: true}
    ).populate("videos")

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Videp removed from playlist")
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {

    const { userId } = req.params

    const playlists = await Playlist.find({
        owner: userId
    })

    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    const playlist = await Playlist.findById(playlistId)
        .populate("videos")
        .populate("owner", "username avatar")

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params
    const { name, description } = req.body

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {

    const { playlistId } = req.params

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this playlist")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    )
})

export {
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistById,
    getUserPlaylists,
    updatePlaylist,
    deletePlaylist
}