import { Pass } from "../models/pass.model.js";
import { Event } from "../models/event.model.js";

// Controller to fetch all passes

export const getEventPasses = async (req, res) => {
    const { eventId } = req.params;
    try {
        const passes = await Pass.find({
            eventId: eventId
        });
        if (!passes || passes.length === 0) {
            return res.status(404).json(
                {
                    success: false,
                    message: "No Passes for for this event!",
                }
            );
        }
        res.status(200).json({
            success: true,
            passes,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching event passes",
            error: error.message,
        })
    }
}