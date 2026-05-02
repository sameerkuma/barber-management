const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const Service = require('./models/Service');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const auth = require('./middleware/auth');
const superAdminRoutes = require('./routes/superAdmin');
const barberRoutes = require('./routes/barber');
const customerRoutes = require('./routes/customer');

const app = express();
const PORT = process.env.PORT || 8081;

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/ping', (req, res) => {
  res.send('PONG');
});

// routes
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/barber', barberRoutes);
app.use('/api/customer', customerRoutes);

// error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const seedServices = async () => {
  const count = await Service.countDocuments();
  if (count === 0) {
    const defaultServices = [
      {
        name: 'Haircut',
        description: 'Classic haircut with styling',
        duration: 30,
        price: 20,
        category: 'Hair',
        isActive: true
      },
      {
        name: 'Beard Trim',
        description: 'Beard shaping and grooming',
        duration: 20,
        price: 15,
        category: 'Beard',
        isActive: true
      },
      {
        name: 'Wash & Style',
        description: 'Hair wash, conditioner and styling',
        duration: 45,
        price: 25,
        category: 'Hair',
        isActive: true
      }
    ];

    await Service.insertMany(defaultServices);
    console.log('Seeded default services for the customer dashboard.');
  }
};

const seedDefaultBarber = async () => {
  const email = process.env.DEFAULT_BARBER_EMAIL || 'barber@gmail.com';
  const password = process.env.DEFAULT_BARBER_PASSWORD || 'barber123';
  const existingBarber = await User.findOne({ email, role: 'barber' });

  if (!existingBarber) {
    const hashedPassword = await auth.hashPassword(password);

    await User.create({
      name: 'Demo Barber',
      email,
      password: hashedPassword,
      phone: '9999999999',
      role: 'barber'
    });

    console.log(`Seeded default barber account: ${email}`);
  }
};

const seedDemoAppointments = async () => {
  const count = await Appointment.countDocuments();
  if (count > 0) return;

  const services = await Service.find({ isActive: true }).limit(3);
  if (services.length === 0) return;

  const demoCustomers = [
    { name: 'Rohan Sharma', email: 'rohan.demo@barber.com', phone: '9876543210' },
    { name: 'Nisha Patel', email: 'nisha.demo@barber.com', phone: '9876501234' },
    { name: 'Kabir Khan', email: 'kabir.demo@barber.com', phone: '9876512345' }
  ];

  const password = await auth.hashPassword('customer123');
  const customers = [];

  for (const customer of demoCustomers) {
    const user = await User.findOneAndUpdate(
      { email: customer.email },
      { ...customer, password, role: 'customer', isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    customers.push(user);
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const nextDay = new Date(tomorrow);
  nextDay.setDate(nextDay.getDate() + 1);

  await Appointment.insertMany([
    {
      customer: customers[0]._id,
      service: services[0]._id,
      date: tomorrow,
      time: '10:00',
      status: 'pending',
      notes: 'Prefers a clean fade and quick finish.'
    },
    {
      customer: customers[1]._id,
      service: services[1]?._id || services[0]._id,
      date: tomorrow,
      time: '11:30',
      status: 'pending',
      notes: 'Needs beard shaping before an evening event.'
    },
    {
      customer: customers[2]._id,
      service: services[2]?._id || services[0]._id,
      date: nextDay,
      time: '14:00',
      status: 'confirmed',
      notes: 'Wash and style appointment.'
    }
  ]);

  console.log('Seeded demo appointment requests for the barber dashboard.');
};

const startServer = async () => {
  try {
    await connectDB('barber-management');
    await seedServices();
    await seedDefaultBarber();
    await seedDemoAppointments();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
