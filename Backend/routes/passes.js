import { Pass } from "../models/pass";
import express from "express";
const Router = express.Router;

Router.post('/', async (req, res) => {
    const {event} = req.body;

    const passId = Date.now().toString();

    try{
        const newPass = new Pass({
            passId,
            event
        });
        await newPass.save();
        res.status(201).json(newPass);
    }catch(error){
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = Router;