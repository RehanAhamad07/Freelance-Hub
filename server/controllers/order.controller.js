const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const { getCommissionRate } = require('../utils/gamification');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Cloudinary config (assuming it relies on env vars or we just mock if not set)
if (process.env.CLOUDINARY_URL) {
  // It auto-configures if CLOUDINARY_URL is present
}

// Helper to calculate deadline based on delivery time (e.g. '3 Days')
const calculateDeadline = (deliveryTimeStr) => {
  const days = parseInt(deliveryTimeStr) || 3;
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);
  return deadline;
};

const DISPUTE_WINDOW_HOURS = 72;
const ADMIN_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(v => v.trim()).filter(Boolean);

const isAdminUser = async (userId) => {
  if (!userId) return false;
  if (ADMIN_IDS.includes(userId.toString())) return true;
  const user = await User.findById(userId).select('roles');
  return !!(user && Array.isArray(user.roles) && user.roles.includes('admin'));
};

const saveDeliveryFileLocally = async (file) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'deliveries');
  await fs.promises.mkdir(uploadsDir, { recursive: true });

  const originalExt = path.extname(file.originalname || '');
  const safeExt = originalExt || '';
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.promises.writeFile(filePath, file.buffer);
  return `/uploads/deliveries/${fileName}`;
};

const saveDisputeFileLocally = async (file) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'disputes');
  await fs.promises.mkdir(uploadsDir, { recursive: true });

  const originalExt = path.extname(file.originalname || '');
  const safeExt = originalExt || '';
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.promises.writeFile(filePath, file.buffer);
  return `/uploads/disputes/${fileName}`;
};

const createOrder = async (req, res) => {
  try {
    const { serviceId, addons } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.freelancer.toString() === req.user.userId) {
      return res.status(400).json({ error: 'You cannot place an order on your own service.' });
    }

    const buyer = await User.findById(req.user.userId);
    if (!buyer) return res.status(404).json({ error: 'User not found' });

    // Calculate total with add-ons
    let totalPrice = service.price;
    const selectedAddons = [];
    if (addons && Array.isArray(addons) && service.addons) {
      for (const addonId of addons) {
        const addon = service.addons.id(addonId);
        if (addon) {
          totalPrice += addon.price;
          selectedAddons.push({ title: addon.title, price: addon.price });
        }
      }
    }

    // Escrow logic: Deduct money from buyer wallet
    if (buyer.walletBalance < totalPrice) {
      return res.status(400).json({ error: 'Insufficient wallet balance. Please top up your account.' });
    }

    buyer.walletBalance -= totalPrice;
    await buyer.save();

    const order = new Order({
      client: req.user.userId,
      freelancer: service.freelancer,
      service: service._id,
      price: totalPrice,
      currency: service.currency || 'USD',
      escrowAmount: totalPrice,
      selectedAddons,
      status: 'in_progress',
      deliveryTime: service.deliveryTime,
      deadline: calculateDeadline(service.deliveryTime)
    });

    await order.save();

    const addonText = selectedAddons.length > 0 ? ` (includes ${selectedAddons.length} add-on${selectedAddons.length > 1 ? 's' : ''})` : '';
    const notif = new Notification({
      recipient: service.freelancer,
      type: 'order_created',
      message: `You have a new order for "${service.title}"${addonText}. The funds ($${totalPrice}) are securely held in escrow.`,
      link: `/dashboard`
    });
    await notif.save();
    
    if (req.io) {
      req.io.to(service.freelancer.toString()).emit('newNotification', notif);
    }

    res.status(201).json({ message: 'Order created successfully. Funds held in escrow.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deliverOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const file = req.file;

    const order = await Order.findById(id).populate('service');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.freelancer.toString() !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });
    if (order.status !== 'in_progress' && order.status !== 'in progress') {
      return res.status(400).json({ error: 'Order is not in progress' });
    }

    let fileUrl = '';
    
    // Upload file if exists
    if (file) {
      try {
        const b64 = Buffer.from(file.buffer).toString('base64');
        let dataURI = "data:" + file.mimetype + ";base64," + b64;
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          resource_type: 'auto',
          folder: 'freelance_deliveries'
        });
        fileUrl = uploadResponse.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        // Fallback: persist actual file locally so client can still review it.
        fileUrl = await saveDeliveryFileLocally(file);
      }
    }

    // Save Delivery
    const delivery = new Delivery({
      order: order._id,
      file: fileUrl,
      message: message || ''
    });
    await delivery.save();

    // Update Order Status
    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.disputeWindowEndsAt = new Date(Date.now() + DISPUTE_WINDOW_HOURS * 60 * 60 * 1000);
    await order.save();

    // Alert client
    const notif = new Notification({
      recipient: order.client,
      type: 'work_delivered',
      message: `Freelancer has delivered work for "${order.service.title}". Please review and accept.`,
      link: `/dashboard`
    });
    await notif.save();
    
    if (req.io) {
      req.io.to(order.client.toString()).emit('newNotification', notif);
    }

    res.json({ message: 'Work delivered successfully', order, delivery });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('service');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.client.toString() !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });
    if (order.status !== 'delivered') return res.status(400).json({ error: 'Order is not delivered yet' });

    const seller = await User.findById(order.freelancer);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    // Dynamic commission based on freelancer level
    const commissionRate = getCommissionRate(seller);
    const platformFee = Math.round(order.escrowAmount * commissionRate);
    const payoutAmount = order.escrowAmount - platformFee;

    seller.walletBalance += payoutAmount;
    seller.totalEarnings = (seller.totalEarnings || 0) + payoutAmount;
    await seller.save();

    order.status = 'completed';
    order.escrowAmount = 0;
    await order.save();

    // Referral credit: if buyer was referred, credit referrer 2% of platform fee
    const buyer = await User.findById(order.client);
    if (buyer && buyer.referredBy && !order.referralCredited) {
      const referrer = await User.findById(buyer.referredBy);
      if (referrer) {
        const referralBonus = Math.round(platformFee * 0.02 * 100) / 100;
        if (referralBonus > 0) {
          referrer.walletBalance += referralBonus;
          await referrer.save();
          order.referralCredited = true;
          await order.save();
        }
      }
    }

    const notif = new Notification({
      recipient: order.freelancer,
      type: 'order_completed',
      message: `Client accepted "${order.service.title}". $${payoutAmount} credited (${Math.round(commissionRate * 100)}% fee applied).`,
      link: `/dashboard`
    });
    await notif.save();
    
    if (req.io) {
      req.io.to(order.freelancer.toString()).emit('newNotification', notif);
    }

    res.json({ message: 'Order completed and payment released', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const revisionOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('service');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.client.toString() !== req.user.userId) return res.status(403).json({ error: 'Unauthorized' });
    if (order.status !== 'delivered') return res.status(400).json({ error: 'Order is not in delivered status' });

    order.status = 'in_progress';
    order.revisionCount = (order.revisionCount || 0) + 1;
    await order.save();

    // Alert freelancer
    const notif = new Notification({
      recipient: order.freelancer,
      type: 'revision_requested',
      message: `Client requested a revision for "${order.service.title}". Order is back in progress.`,
      link: `/dashboard`
    });
    await notif.save();
    
    if (req.io) {
      req.io.to(order.freelancer.toString()).emit('newNotification', notif);
    }

    res.json({ message: 'Revision requested', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const disputeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, reason } = req.body || {};
    const order = await Order.findById(id).populate('service');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const isClient = order.client.toString() === req.user.userId;
    const isFreelancer = order.freelancer.toString() === req.user.userId;
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Only delivered orders can be disputed' });
    }
    if (order.status === 'disputed') {
      return res.status(400).json({ error: 'Order is already disputed' });
    }

    const allowedCategories = ['quality_issue', 'not_as_described', 'late_delivery', 'plagiarism', 'fraud', 'other'];
    const disputeCategory = typeof category === 'string' ? category.trim() : '';
    const disputeReason = typeof reason === 'string' ? reason.trim() : '';

    if (!allowedCategories.includes(disputeCategory)) {
      return res.status(400).json({ error: 'Please select a valid dispute category' });
    }
    if (disputeReason.length < 20) {
      return res.status(400).json({ error: 'Please provide at least 20 characters explaining the issue' });
    }

    // Buyer-side anti-scam checks: dispute must be timely and quality issues should go to revision first.
    if (isClient) {
      const now = new Date();
      if (order.disputeWindowEndsAt && now > order.disputeWindowEndsAt) {
        return res.status(400).json({ error: 'Dispute window has closed. Please contact support/admin.' });
      }
      if (disputeCategory === 'quality_issue' && (order.revisionCount || 0) === 0) {
        return res.status(400).json({ error: 'For quality issues, request at least one revision before opening dispute' });
      }
    }

    order.status = 'disputed';
    order.disputeCategory = disputeCategory;
    order.disputeReason = disputeReason;
    order.disputeOpenedBy = req.user.userId;
    order.disputeOpenedAt = new Date();
    order.disputeTimeline = [
      ...(order.disputeTimeline || []),
      {
        actor: req.user.userId,
        action: 'opened',
        note: disputeReason,
        createdAt: new Date()
      }
    ];
    await order.save();

    // Alert the other party
    const recipient = order.client.toString() === req.user.userId ? order.freelancer : order.client;
    const notif = new Notification({
      recipient: recipient,
      type: 'order_disputed',
      message: `A dispute (${disputeCategory.replace('_', ' ')}) was opened for "${order.service.title}". Escrow is frozen pending resolution.`,
      link: `/dashboard`
    });
    await notif.save();
    
    if (req.io) {
      req.io.to(recipient.toString()).emit('newNotification', notif);
    }

    res.json({ message: 'Order disputed', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const addDisputeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    const comment = typeof note === 'string' ? note.trim() : '';
    if (comment.length < 10) {
      return res.status(400).json({ error: 'Comment should be at least 10 characters' });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const isClient = order.client.toString() === req.user.userId;
    const isFreelancer = order.freelancer.toString() === req.user.userId;
    if (!isClient && !isFreelancer) return res.status(403).json({ error: 'Unauthorized' });
    if (order.status !== 'disputed') return res.status(400).json({ error: 'Order is not disputed' });

    const evidenceFile = req.file;
    let attachmentUrl = '';
    let attachmentName = '';
    let attachmentMimeType = '';

    if (evidenceFile) {
      try {
        const b64 = Buffer.from(evidenceFile.buffer).toString('base64');
        const dataURI = `data:${evidenceFile.mimetype};base64,${b64}`;
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          resource_type: 'auto',
          folder: 'freelance_dispute_evidence'
        });
        attachmentUrl = uploadResponse.secure_url;
      } catch (uploadErr) {
        console.error('Dispute evidence upload error:', uploadErr);
        attachmentUrl = await saveDisputeFileLocally(evidenceFile);
      }

      attachmentName = evidenceFile.originalname || '';
      attachmentMimeType = evidenceFile.mimetype || '';
    }

    order.disputeTimeline = [
      ...(order.disputeTimeline || []),
      {
        actor: req.user.userId,
        action: isClient ? 'buyer_comment' : 'seller_comment',
        note: comment,
        attachmentUrl,
        attachmentName,
        attachmentMimeType,
        createdAt: new Date()
      }
    ];
    await order.save();

    const recipient = isClient ? order.freelancer : order.client;
    const notif = new Notification({
      recipient,
      type: 'order_disputed',
      message: `New dispute comment added for order ${order._id}.`,
      link: `/dashboard`
    });
    await notif.save();
    if (req.io) req.io.to(recipient.toString()).emit('newNotification', notif);

    res.json({ message: 'Dispute comment added', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getDisputedOrders = async (req, res) => {
  try {
    const admin = await isAdminUser(req.user.userId);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const orders = await Order.find({ status: 'disputed' })
      .populate('service', 'title currency')
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .populate('disputeOpenedBy', 'name email')
      .populate('disputeTimeline.actor', 'name email')
      .sort({ disputeOpenedAt: -1, updatedAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const resolveDispute = async (req, res) => {
  try {
    const admin = await isAdminUser(req.user.userId);
    if (!admin) return res.status(403).json({ error: 'Admin access required' });

    const { id } = req.params;
    const { outcome, notes } = req.body || {};
    const validOutcome = ['released_to_seller', 'refunded_to_buyer'];
    if (!validOutcome.includes(outcome)) {
      return res.status(400).json({ error: 'Invalid dispute outcome' });
    }
    const resolutionNotes = typeof notes === 'string' ? notes.trim() : '';
    if (resolutionNotes.length < 10) {
      return res.status(400).json({ error: 'Resolution notes should be at least 10 characters' });
    }

    const order = await Order.findById(id).populate('service');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'disputed') {
      return res.status(400).json({ error: 'Only disputed orders can be resolved' });
    }
    if (order.escrowAmount <= 0) {
      return res.status(400).json({ error: 'Escrow amount already released or refunded' });
    }

    const buyer = await User.findById(order.client);
    const seller = await User.findById(order.freelancer);
    if (!buyer || !seller) return res.status(404).json({ error: 'Buyer or seller not found' });

    if (outcome === 'released_to_seller') {
      const commissionRate = getCommissionRate(seller);
      const platformFee = Math.round(order.escrowAmount * commissionRate);
      const payoutAmount = order.escrowAmount - platformFee;
      seller.walletBalance += payoutAmount;
      seller.totalEarnings = (seller.totalEarnings || 0) + payoutAmount;
    } else {
      buyer.walletBalance += order.escrowAmount;
    }
    await Promise.all([buyer.save(), seller.save()]);

    order.status = 'completed';
    order.disputeResolution = {
      outcome,
      notes: resolutionNotes,
      resolvedBy: req.user.userId,
      resolvedAt: new Date()
    };
    order.disputeTimeline = [
      ...(order.disputeTimeline || []),
      {
        actor: req.user.userId,
        action: 'admin_resolution',
        note: `Outcome: ${outcome}. ${resolutionNotes}`,
        createdAt: new Date()
      }
    ];
    order.escrowAmount = 0;
    await order.save();

    const commonMessage = outcome === 'released_to_seller'
      ? `Dispute resolved: funds released to freelancer for "${order.service?.title || 'order'}".`
      : `Dispute resolved: full refund issued to client for "${order.service?.title || 'order'}".`;
    const notifications = [
      new Notification({ recipient: order.client, type: 'order_completed', message: commonMessage, link: '/dashboard' }),
      new Notification({ recipient: order.freelancer, type: 'order_completed', message: commonMessage, link: '/dashboard' })
    ];
    await Notification.insertMany(notifications);
    if (req.io) {
      req.io.to(order.client.toString()).emit('newNotification', notifications[0]);
      req.io.to(order.freelancer.toString()).emit('newNotification', notifications[1]);
    }

    res.json({ message: 'Dispute resolved successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { client: req.user.userId },
        { freelancer: req.user.userId }
      ]
    })
      .populate('service', 'title images currency')
      .populate('client', 'name profilePicture')
      .populate('freelancer', 'name profilePicture')
      .sort({ createdAt: -1 });
      
    // Optionally fetch deliveries for these orders
    const orderIds = orders.map(o => o._id);
    const deliveries = await Delivery.find({ order: { $in: orderIds } }).sort({ createdAt: -1 });

    // Attach latest delivery to order (in memory)
    const formattedOrders = orders.map(o => {
      const orderObj = o.toObject();
      const orderDeliveries = deliveries.filter(d => d.order.toString() === o._id.toString());
      if (orderDeliveries.length > 0) {
        orderObj.latestDelivery = orderDeliveries[0];
      }
      return orderObj;
    });

    res.json(formattedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { 
  createOrder, 
  deliverOrder, 
  acceptOrder, 
  revisionOrder, 
  disputeOrder, 
  getOrders,
  addDisputeComment,
  getDisputedOrders,
  resolveDispute
};
