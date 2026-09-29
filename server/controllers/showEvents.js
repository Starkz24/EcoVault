const Event = require('../models/event.models'); 

const getCreatedEvents = async (req, res) => {
    try {
        const events = await Event.find({});

        res.status(200).json({ success: true, data: events });

    } catch (error) {
        console.error('Error fetching created events:', error.message);
        
        let errorMessage = 'Failed to fetch events';
        if (error.name === 'CastError') {
            errorMessage = 'Invalid event ID';
        }

        res.status(500).json({ success: false, error: errorMessage });
    }
};

module.exports = { getCreatedEvents };
