import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { User, Product, Notification } from '../backend/models.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGODB_URI is not set. API will fail to fetch/save data.');
}

// ---------------- AUTH ROUTES ----------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered.' });
    
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    
    // Convert _id to id for the frontend
    const userObj = newUser.toObject();
    userObj.id = userObj._id.toString();
    delete userObj._id;
    
    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    
    const userObj = user.toObject();
    userObj.id = userObj._id.toString();
    delete userObj._id;
    
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- PRODUCT ROUTES ----------------
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    const formatted = products.map(p => {
        const obj = p.toObject();
        obj.id = obj._id.toString();
        delete obj._id;
        return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    
    const obj = newProduct.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    
    res.status(201).json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id/quantity', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({error: 'Product not found'});
        
        product.quantityAvailable = req.body.quantityAvailable;
        await product.save();
        res.json(product);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------- NOTIFICATION (ORDER) ROUTES ----------------
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find();
    const formatted = notifications.map(n => {
        const obj = n.toObject();
        obj.id = obj._id.toString();
        delete obj._id;
        return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const newNotifications = await Notification.insertMany(req.body);
    const formatted = newNotifications.map(n => {
        const obj = n.toObject();
        obj.id = obj._id.toString();
        delete obj._id;
        return obj;
    });
    res.status(201).json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the Express app for Vercel Serverless
export default app;

// If running locally, start the server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Express API running on port ${PORT}`);
  });
}
