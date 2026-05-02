const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/freelance_hub').then(async () => {
  const db = mongoose.connection.db;
  
  // Fix roles
  await db.collection('users').updateMany({ roles: { $exists: false } }, [{ $set: { roles: ['$role'] } }]);
  console.log('Fixed missing roles');
  
  // Set password for rehanah9434@gmail.com
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('12345678', salt);
  await db.collection('users').updateOne({ email: 'rehanah9434@gmail.com' }, { $set: { password: hash } });
  console.log('Reset password for rehanah9434@gmail.com to 12345678');
  
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
