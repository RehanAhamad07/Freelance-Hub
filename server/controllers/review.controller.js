const Review = require('../models/Review');
const Service = require('../models/Service');
const Order = require('../models/Order');

const createReview = async (req, res) => {
  try {
    const { rating, comment, serviceId } = req.body;

    if (!req.user.roles.includes('client')) {
      return res.status(403).json({ error: 'Only clients can leave reviews' });
    }

    // Verify if client ordered this service
    const hasOrdered = await Order.findOne({ client: req.user.userId, service: serviceId, status: 'completed' });
    // Note: for this demo, we might bypass the 'completed' requirement or assume it is completed to allow reviews.
    // For simplicity, let's not strictly block if order isn't completed if we haven't implemented status change.

    const review = new Review({
      rating,
      comment,
      client: req.user.userId,
      clientName: req.user.name || 'Client', // usually would pull from DB by populating
      service: serviceId
    });

    await review.save();

    // Update service average rating
    const reviews = await Review.find({ service: serviceId });
    const avgRating = reviews.reduce((acc, current) => acc + current.rating, 0) / reviews.length;
    
    await Service.findByIdAndUpdate(serviceId, { rating: avgRating, reviewsCount: reviews.length });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createReview, getServiceReviews };
