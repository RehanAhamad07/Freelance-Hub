const cron = require('node-cron');
const Order = require('../models/Order');
const User = require('../models/User');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('[Cron] Running auto-complete check for delivered orders...');
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find orders that have been 'delivered' and the delivery happened > 3 days ago
    // We check updatedAt since it gets updated when status changes to 'delivered'
    const orders = await Order.find({
      status: 'delivered',
      updatedAt: { $lte: threeDaysAgo }
    });

    for (let order of orders) {
      console.log(`[Cron] Auto-completing order ${order._id}`);
      
      const seller = await User.findById(order.freelancer);
      if (seller && order.escrowAmount > 0) {
        const platformFee = Math.round(order.escrowAmount * 0.10);
        const payoutAmount = order.escrowAmount - platformFee;

        seller.walletBalance += payoutAmount;
        await seller.save();

        order.status = 'completed';
        order.escrowAmount = 0;
        await order.save();
        
        console.log(`[Cron] Order ${order._id} completed and funds released.`);
      }
    }
  } catch (error) {
    console.error('[Cron Error] Auto-complete failed:', error);
  }
});
