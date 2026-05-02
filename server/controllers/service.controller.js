const Service = require('../models/Service');

const createService = async (req, res) => {
  try {
    if (!req.user.roles.includes('freelancer')) {
      return res.status(403).json({ error: 'Only freelancers can create services' });
    }

    const service = new Service({
      ...req.body,
      freelancer: req.user.userId,
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getServices = async (req, res) => {
  try {
    const { category, search, freelancer, minPrice, maxPrice, minRating } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (freelancer) query.freelancer = freelancer;
    if (search) query.title = { $regex: search, $options: 'i' };
    
    // Price range filtering - ensure proper type conversion
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) query.price.$gte = min;
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) query.price.$lte = max;
      }
    }
    
    // Rating filtering
    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) query.rating = { $gte: rating };
    }

    const services = await Service.find(query).populate('freelancer', 'name profilePicture rating').lean();
    res.json(services);
  } catch (error) {
    console.error('Service fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('freelancer', 'name email profilePicture bio rating completedJobs');
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, freelancer: req.user.userId },
      req.body,
      { new: true }
    );
    if (!service) return res.status(404).json({ error: 'Service not found or unauthorized' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ _id: req.params.id, freelancer: req.user.userId });
    if (!service) return res.status(404).json({ error: 'Service not found or unauthorized' });
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createService, getServices, getServiceById, updateService, deleteService };
