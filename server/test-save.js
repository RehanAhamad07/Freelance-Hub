const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/freelance_hub');
  console.log('Connected to DB');
  
  try {
    const user = await User.findOne({});
    console.log('User ID:', user._id);
    
    const service = await Service.findOne({});
    console.log('Service ID:', service ? service._id : 'Not Found');
    
    if (service) {
      console.log('Service id to add:', service._id.toString());
      const updated = await User.findByIdAndUpdate(
        user._id,
        { $addToSet: { savedServices: service._id } },
        { new: true }
      );
      console.log('Updated user savedServices:', updated.savedServices);
    }
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    process.exit(0);
  }
}
test();
