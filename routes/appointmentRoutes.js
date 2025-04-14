const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment");
// const { jwtAuthMiddleware} = require("../jwt");

router.post('/book', async (req, res) => {
    try {
        const { name, phone, service, date, time,priority } = req.body;


        // Validate required fields
        if (!name || !phone || !service || !date || !time || !priority) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        // console.log(name, phone, service, date, time,email)

        // Create a new appointment and store client's email from JWT
        const newAppointment = new Appointment({
            name,
            phone,
            service,
            date,
            time,
            bookingType:priority
            
        });

        await newAppointment.save();
        res.status(201).json({ success: true, message: "Appointment booked successfully", appointment: newAppointment });
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});





module.exports = router;
