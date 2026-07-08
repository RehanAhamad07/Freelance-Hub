const cron = require('node-cron');
const Order = require('../models/Order');
const User = require('../models/User');
const { getCommissionRate } = require('../utils/gamification');

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('[Cron] Running auto-complete check for delivered orders...');
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const orders = await Order.find({
      status: 'delivered',
      updatedAt: { $lte: threeDaysAgo }
    });

    for (let order of orders) {
      console.log(`[Cron] Auto-completing order ${order._id}`);
      
      const seller = await User.findById(order.freelancer);
      if (seller && order.escrowAmount > 0) {
        const commissionRate = getCommissionRate(seller);
        const platformFee = Math.round(order.escrowAmount * commissionRate);
        const payoutAmount = order.escrowAmount - platformFee;

        seller.walletBalance += payoutAmount;
        seller.totalEarnings = (seller.totalEarnings || 0) + payoutAmount;
        await seller.save();

        order.status = 'completed';
        order.escrowAmount = 0;
        await order.save();
        
        console.log(`[Cron] Order ${order._id} completed. ${Math.round(commissionRate*100)}% fee applied.`);
      }
    }
  } catch (error) {
    console.error('[Cron Error] Auto-complete failed:', error);
  }
});
