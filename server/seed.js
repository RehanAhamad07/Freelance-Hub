const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

require('dotenv').config();

const categories = [
  'Programming & Tech',
  'Graphics & Design',
  'Video & Animation',
  'Writing & Translation',
  'Music & Audio'
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelance-marketplace');
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error('Error connecting to DB:', error);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await User.deleteMany();
    await Service.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    // Create users with both client and freelancer roles
    const createdUsers = await User.insertMany([
      { name: 'John Client', email: 'client1@test.com', password, roles: ['client', 'freelancer'] },
      { name: 'Alice Client', email: 'client2@test.com', password, roles: ['client', 'freelancer'] },
      { name: 'Pro Dev', email: 'dev@test.com', password, roles: ['client', 'freelancer'], bio: 'Expert Developer', skills: ['React', 'Node'] },
      { name: 'Anna Designer', email: 'design@test.com', password, roles: ['client', 'freelancer'], bio: 'Creative Designer', skills: ['Figma', 'Photoshop'] },
      { name: 'Mike Writer', email: 'write@test.com', password, roles: ['client', 'freelancer'], bio: 'SEO Copywriter', skills: ['SEO', 'Blogging'] }
    ]);

    const createdClients = createdUsers.slice(0, 2);
    const createdFreelancers = createdUsers.slice(2, 5);

    // Create Services
    const sampleServices = [
      {
        title: 'I will build a full-stack MERN application',
        description: 'I will create a scalable MERN application with React, Node.js, Express, and MongoDB. Delivery includes full source code.',
        price: 300,
        deliveryTime: '7 Days',
        category: 'Programming & Tech',
        freelancer: createdFreelancers[0]._id,
        rating: 5,
        reviewsCount: 2
      },
      {
        title: 'I will write a python scraping script',
        description: 'Need data? I will build a python script using BeautifulSoup and Selenium to scrape any website.',
        price: 50,
        deliveryTime: '2 Days',
        category: 'Programming & Tech',
        freelancer: createdFreelancers[0]._id,
        rating: 4.8,
        reviewsCount: 10
      },
      {
        title: 'I will design a modern minimalist UI/UX in Figma',
        description: 'I will design a beautiful, modern, and user-friendly interface for your mobile app or website.',
        price: 150,
        deliveryTime: '4 Days',
        category: 'Graphics & Design',
        freelancer: createdFreelancers[1]._id,
        rating: 5,
        reviewsCount: 15
      },
      {
        title: 'I will create vector illustrations',
        description: 'Detailed, beautiful vector illustrations for your landing pages or books.',
        price: 80,
        deliveryTime: '3 Days',
        category: 'Graphics & Design',
        freelancer: createdFreelancers[1]._id,
        rating: 0,
        reviewsCount: 0
      },
      {
        title: 'I will write SEO optimized blog posts',
        description: 'High quality, engaging, and SEO-friendly articles to rank higher on Google.',
        price: 30,
        deliveryTime: '1 Day',
        category: 'Writing & Translation',
        freelancer: createdFreelancers[2]._id,
        rating: 4.5,
        reviewsCount: 8
      },
      {
        title: 'I will create an awesome animated explainer video',
        description: '2D Animation that tells your brand story perfectly.',
        price: 250,
        deliveryTime: '10 Days',
        category: 'Video & Animation',
        freelancer: createdFreelancers[1]._id,
        rating: 4.9,
        reviewsCount: 5
      },
      {
        title: 'I will translate English to Spanish perfectly',
        description: 'Native Spanish translator for any document.',
        price: 15,
        deliveryTime: '1 Day',
        category: 'Writing & Translation',
        freelancer: createdFreelancers[2]._id,
        rating: 5,
        reviewsCount: 100
      },
      {
        title: 'I will mix and master your song',
        description: 'Professional audio engineering to make your tracks radio-ready.',
        price: 120,
        deliveryTime: '5 Days',
        category: 'Music & Audio',
        freelancer: createdFreelancers[0]._id,
        rating: 4.7,
        reviewsCount: 12
      }
    ];

    const insertedServices = await Service.insertMany(sampleServices);

    // Create some fake reviews to match the ratings
    const fakeReviews = [
      {
        rating: 5,
        comment: 'Amazing work! Delivered exactly what I wanted.',
        clientName: 'John Client',
        client: createdClients[0]._id,
        service: insertedServices[0]._id
      },
      {
        rating: 5,
        comment: 'The design is breathtaking. Highly recommend Anna!',
        clientName: 'Alice Client',
        client: createdClients[1]._id,
        service: insertedServices[2]._id
      }
    ];

    await Review.insertMany(fakeReviews);

    console.log('Data Imported successfully!');
    console.log('Login mapping: \nclient1@test.com : 123456\ndev@test.com : 123456');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

connectDB().then(importData);
