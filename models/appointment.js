const mongoose = require("mongoose");

const bookAppointmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    service: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    bookingType: {type: String, required: true}
    
}, { timestamps: true });

module.exports = mongoose.model("Appointment", bookAppointmentSchema);
