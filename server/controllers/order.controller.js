const Order = require('../models/Order');
const Service = require('../models/Service');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Mocking for now

const createOrder = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    // Removed role constraint to allow all users to place orders

    // Mocking Stripe flow. In reality, create a Stripe session and return its URL.
    // Assuming payment is instantly successful for this mock.
    const order = new Order({
      client: req.user.userId,
      freelancer: service.freelancer,
      service: service._id,
      price: service.price,
      status: 'in progress',
      deliveryTime: service.deliveryTime,
      stripeSessionId: 'mock_stripe_sess_' + Math.random().toString(36).substring(7)
    });

    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'client') {
      query.client = req.user.userId;
    } else {
      query.freelancer = req.user.userId;
    }

    const orders = await Order.find(query)
      .populate('service', 'title images')
      .populate('client', 'name profilePicture')
      .populate('freelancer', 'name profilePicture');
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createOrder, getOrders };
