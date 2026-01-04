const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Models
const Ticket = require('./models/Ticket');
const User = require('./models/User');

// Controllers & Middleware
const { loginUser, registerUser } = require('./controllers/authController');
const { protect, admin } = require('./middleware/authMiddleware');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await seedUsers();
  })
  .catch(err => console.error('MongoDB Error:', err));

const seedUsers = async () => {
  try {
    const adminExists = await User.findOne({ email: 'georgeberas@hotmail.com' });
    const userExists = await User.findOne({ email: 'georgeberas@gmail.com' });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      await User.create({ name: 'George Admin', email: 'georgeberas@hotmail.com', password: hashedPassword, role: 'admin' });
      console.log('Admin Created');
    }

    if (!userExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      await User.create({ name: 'George User', email: 'georgeberas@gmail.com', password: hashedPassword, role: 'user' });
      console.log('User Created');
    }
  } catch (error) {
    console.error('Seeder Error:', error);
  }
};

// Routes
app.post('/api/auth/login', loginUser);
app.post('/api/auth/register', registerUser);

app.get('/api/tickets', protect, async (req, res) => {
  try {
    let tickets;
    if (req.user.role === 'admin') {
      tickets = await Ticket.find().sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ user: req.user.email }).sort({ createdAt: -1 });
    }
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // En producción, especificar el dominio del cliente
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join_ticket', (ticketId) => {
    socket.join(ticketId);
  });

  socket.on('leave_ticket', (ticketId) => {
    socket.leave(ticketId);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Make io accessible in routes
app.set('socketio', io);

// ----- RUTAS MODIFICADAS CON EMITS -----

// Create Ticket
app.post('/api/tickets', protect, async (req, res) => {
  try {
    const { subject, description } = req.body;
    const newTicket = new Ticket({ subject, user: req.user.email, description });
    const savedTicket = await newTicket.save();

    // Notificar a todos (dashboard update)
    req.app.get('socketio').emit('tickets_updated');

    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update Status (Admin only)
app.put('/api/tickets/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });

    ticket.status = status;
    await ticket.save();

    // Notificar actualización general y específica al ticket room
    req.app.get('socketio').emit('tickets_updated');
    req.app.get('socketio').to(req.params.id).emit('ticket_updated', ticket);

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Ticket (Admin only)
app.delete('/api/tickets/:id', protect, admin, async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    req.app.get('socketio').emit('tickets_updated');
    res.json({ message: 'Ticket eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Comment
app.post('/api/tickets/:id/comments', protect, async (req, res) => {
  try {
    const { texto } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });

    const newComment = {
      usuario: req.user.name,
      texto,
      esAdmin: req.user.role === 'admin'
    };

    ticket.comments.push(newComment);
    await ticket.save();

    // Notificar al room del ticket
    req.app.get('socketio').to(req.params.id).emit('ticket_updated', ticket);
    // Opcional: Notificar al dashboard si quieres mostrar último comentario
    req.app.get('socketio').emit('tickets_updated');

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
