const bcrypt = require('bcryptjs');
const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');
const User = require('./models/User');

// Development-only bootstrap. Production accounts should be provisioned securely.
const seedAdmin = async () => {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password || await User.exists({ email })) return;
  await User.create({ name: 'System Administrator', email, passwordHash: await bcrypt.hash(password, 12), role: 'admin' });
};

const startServer = async () => {
  await connectDB();
  await seedAdmin();
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
};

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
