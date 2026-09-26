const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

//Get all events
router.get('/',async (req,res) =>{
    try{
        const events = await Event.find();
        res.json(events);
    }catch(err){
        res.status(500).json({message: err.message});

    }
});

//Get one event by ID
router.get('/:id', async (req,res) =>{
    try{
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({message: 'Event not found'});
        res.json(event);
    }catch(err){
        res.status(500).json({message: err.message});
    }
});  

// POST create a new event
router.post('/', async (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;
    const newEvent = new Event({ title, description, date, location, capacity });
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;