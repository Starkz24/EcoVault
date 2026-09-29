const Event = require('../models/event.models'); 

const createEvent = async (req, res) => {
    try {
        const { title, description, date, time, location } = req.body;

        if (!title || !description || !date || !time || !location) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        const event = await Event.create({
            title,
            description,
            date,
            time,
            location
        });

        res.status(201).json({ success: true, data: event });

    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ success: false, error: 'Failed to create event' });
    }
};

module.exports = { createEvent };
