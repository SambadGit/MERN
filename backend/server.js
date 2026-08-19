const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Login = require('./models/Login');

// Load configuration values from backend/.env, such as PORT and MONGO_URI.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the React app to call this API from a different local port.
app.use(cors());
// Parse JSON request bodies so values sent by fetch() are available in req.body.
app.use(express.json());

// Add an administrator and example products the first time the database is empty.
// This makes the demo usable immediately after it starts.
const seedData = async () => {
  const adminCount = await Login.countDocuments({ username: 'admin' });
  if (adminCount === 0) {
    await Login.create({
      username: 'admin',
      password: 'password1',
      success: true,
      ipAddress: 'seed',
    });
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany([
      {
        name: 'Wireless Mouse',
        description: 'Compact wireless mouse with smooth scrolling.',
        price: 29.99,
        stock: 12,
        soldCount: 3,
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard for productivity and gaming.',
        price: 89.5,
        stock: 7,
        soldCount: 2,
      },
    ]);
  }
};

// Middleware runs before protected routes. It checks the token sent by the frontend
// and calls next() only when the user is allowed to continue.
const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === 'admin-authenticated') {
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized. Please log in first.' });
};

// Simple endpoint used to confirm that the backend process is running.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MERN demo backend is running.' });
});

// Check login details and record every login attempt in MongoDB.
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  // This is a deliberately simple demo login, not production authentication.
  const validUser = username === 'admin' && password === 'password1';

  await Login.create({
    username,
    password,
    success: validUser,
    ipAddress: req.ip || 'local',
  });

  if (!validUser) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  return res.status(200).json({
    message: 'Login successful',
    token: 'admin-authenticated',
    user: { username },
  });
});

// Return all products. The authentication middleware protects this route.
app.get('/api/products', isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products.', error: error.message });
  }
});

// Return one product using the MongoDB document id from the URL.
app.get('/api/products/:id', isAuthenticated, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product.', error: error.message });
  }
});

// Create a new product from the fields sent by the Add Product form.
app.post('/api/products', isAuthenticated, async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({ message: 'Name, description, and price are required.' });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 10,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product.', error: error.message });
  }
});

// Update an existing product. PUT is used because the request replaces the
// editable product values with the submitted values.
app.put('/api/products/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, description, price, stock, soldCount } = req.body;
    const productData = {
      name,
      description,
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : undefined,
      soldCount: soldCount !== undefined ? Number(soldCount) : undefined,
    };

    // Remove fields that were not supplied so they are not saved as undefined.
    Object.keys(productData).forEach((key) => {
      if (productData[key] === undefined) {
        delete productData[key];
      }
    });

    const product = await Product.findByIdAndUpdate(req.params.id, productData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product.', error: error.message });
  }
});

// Delete a product using its MongoDB document id.
app.delete('/api/products/:id', isAuthenticated, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product.', error: error.message });
  }
});

// Complete a purchase by reducing stock and increasing the sold count together.
app.post('/api/transactions', isAuthenticated, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Form values arrive as strings, so convert the quantity before arithmetic.
    const qty = Number(quantity);
    const newStock = product.stock - qty;

    if (newStock < 0) {
      return res.status(400).json({ message: 'Not enough stock for this transaction.' });
    }

    product.stock = newStock;
    product.soldCount += qty;
    await product.save();

    res.json({
      message: 'Transaction successful.',
      product,
      quantity: qty,
    });
  } catch (error) {
    res.status(500).json({ message: 'Transaction failed.', error: error.message });
  }
});

// Connect to the database, insert demo data if needed, and then start Express.
// The server does not accept requests until these startup tasks finish.
const startServer = async () => {
  try {
    await connectDB();
    await seedData();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
