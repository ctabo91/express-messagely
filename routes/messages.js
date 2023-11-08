const express = require("express");
const router = new express.Router();
const Message = require("../models/message");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");
const ExpressError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try{
        let loggedInUser = req.user.username;
        let message = await Message.get(req.params.id);
        if(loggedInUser === message.from_user.username || loggedInUser === message.to_user.username){
            return res.json({message});
        }
        throw new ExpressError("User not authorized to view this message", 401);
    }catch(err){
        return next(err);
    }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async (req, res, next) => {
    try{
        const {toUsername, body} = req.body;
        let message = await Message.create({toUsername, body});
        return res.json({message});
    }catch(err){
        return next(err);
    }
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
    try{
        let loggedInUser = req.user.username;
        let fullMessage = await Message.get(req.params.id);
        if(loggedInUser === fullMessage.to_user.username){
            let message = await Message.markRead(req.params.id);
            return res.json({message});
        }
        throw new ExpressError("User not authorized to read message", 401);
    }catch(err){
        return next(err);
    }
});
