const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Abierto', 'En Progreso', 'Resuelto'],
        default: 'Abierto'
    },
    description: {
        type: String,
        trim: true
    },
    comments: [{
        usuario: String,
        texto: String,
        fecha: { type: Date, default: Date.now },
        esAdmin: Boolean
    }]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
