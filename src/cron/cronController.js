const cron = require('node-cron');
const { Op } = require('sequelize');
const Trade = require('../models/Trade');
const Income = require('../models/Income');

const processDailyProfits = async () => {
  console.log("🔁 Cron is running...");
  try {
    const now = new Date();

    const runningTrades = await Trade.findAll({
      where: {
        status: 'Running',
        endtime: { [Op.lte]: now },
      },
    });

    for (const trade of runningTrades) {
      const userId = trade.user_id;
      const tradeId = trade.id;
      const plan = parseFloat(trade.plan);
      const amount = parseFloat(trade.amount);
      const serverHash = trade.selectedServer;

      let minROI, maxROI;

      if (plan === 0 && amount >= 10 && amount <= 30) {
        minROI = 0.5;
        maxROI = 1;
      } else if (plan === 5 && amount >= 10 && amount <= 30) {
        minROI = 1;
        maxROI = 1.5;
      } else if (plan === 10 && amount >= 100 && amount <= 500) {
        minROI = 1;
        maxROI = 1.5;
      } else if (plan === 50 && amount >= 500 && amount <= 2500) {
        minROI = 1.5;
        maxROI = 2;
      } else if (plan === 120 && amount >= 2500 && amount <= 10000) {
        minROI = 2;
        maxROI = 2.5;
      } else if (plan === 340 && amount >= 10000) {
        minROI = 2;
        maxROI = 2.5;
      } else {
        continue; // Skip invalid trade ranges
      }

      const roiPercent = (Math.random() * (maxROI - minROI) + minROI) / 100;
      const roiAmount = parseFloat((amount * roiPercent).toFixed(2));

      // ✅ Insert income entry
      const income = await Income.create({
        user_id: userId,
        user_id_fk: tradeId,
        amt: amount,
        comm: roiAmount,
        ttime: new Date(),
        credit_type: 0,
        level: 0,
        type: 'ROI',
        remarks: 'Trade Income',
      });

      // ✅ Update trade status after income created
      if (income) {
        await Trade.update(
          { status: "Complete" },
          { where: { id: tradeId } }
        );

       }
    }

  } catch (error) {
    console.error('❌ Error processing daily profits:', error);
  }
};

// 🕛 Schedule daily at 12:00 PM
cron.schedule('0 * * * *', async () => {
  console.log("⏳ Running scheduled daily profit cron...");
  await processDailyProfits();
});

// 🧪 Optional: Run immediately for testing
 processDailyProfits();