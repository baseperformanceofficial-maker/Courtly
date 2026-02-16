import cron from "node-cron";
import { GymUsers } from "../model/gymUserSchema.js";

// Run every midnight
cron.schedule("0 0 * * *", async () => {
  const now = new Date();
  
  // Also run at 12:05 AM to catch any edge cases
  // cron.schedule("5 0 * * *", async () => {
  
  console.log("🕛 Running subscription status update at", now.toISOString());

  try {
    // First, let's check what's in the database
    const sampleUsers = await GymUsers.find({}).limit(5).lean();
    console.log("📊 Sample user data (first 5):");
    sampleUsers.forEach(user => {
      console.log(`User ${user.name}:`, {
        subscription: user.subscription,
        endDateType: typeof user.subscription?.endDate,
        endDateValue: user.subscription?.endDate,
        isDate: user.subscription?.endDate instanceof Date
      });
    });

    // Fix 1: Ensure all subscription dates are proper Date objects
    await GymUsers.updateMany(
      { "subscription.endDate": { $type: "string" } },
      [{ $set: { 
        "subscription.endDate": { 
          $dateFromString: { dateString: "$subscription.endDate" } 
        }
      }}]
    ).catch(err => console.log("No string dates to convert or error:", err.message));

    await GymUsers.updateMany(
      { "subscription.startDate": { $type: "string" } },
      [{ $set: { 
        "subscription.startDate": { 
          $dateFromString: { dateString: "$subscription.startDate" } 
        }
      }}]
    ).catch(err => console.log("No string dates to convert or error:", err.message));

    // Fix 2: Use proper date comparison with timezone consideration
    // Create date objects for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999); // End of today

    console.log("📅 Today range:", {
      start: today.toISOString(),
      end: endOfToday.toISOString()
    });

    // Mark expired subscriptions (endDate is before today)
    const expiredResult = await GymUsers.updateMany(
      { 
        "subscription.endDate": { 
          $lt: today  // Less than start of today
        },
        "subscription.status": { $ne: "expired" } // Only update if not already expired
      },
      { 
        $set: { 
          "subscription.status": "expired",
          "subscription.expiredAt": new Date()
        } 
      }
    );

    console.log(`✅ Marked ${expiredResult.modifiedCount} subscriptions as expired`);

    // Mark active subscriptions (endDate is today or in future, startDate is today or in past)
    const activeResult = await GymUsers.updateMany(
      { 
        "subscription.startDate": { $lte: endOfToday }, // Started on or before today
        "subscription.endDate": { $gte: today },        // Ends today or later
        $or: [
          { "subscription.status": { $ne: "active" } },
          { "subscription.status": { $exists: false } }
        ]
      },
      { 
        $set: { "subscription.status": "active" },
        $unset: { "subscription.expiredAt": "" }
      }
    );

    console.log(`✅ Marked ${activeResult.modifiedCount} subscriptions as active`);

    // Also check for subscriptions that end today and mark them as about to expire
    const expiringTodayResult = await GymUsers.updateMany(
      { 
        "subscription.endDate": { 
          $gte: today,
          $lte: endOfToday
        },
        "subscription.status": "active"
      },
      { 
        $set: { 
          "subscription.status": "expiring-today",
          "subscription.expiringToday": true 
        } 
      }
    );

    if (expiringTodayResult.modifiedCount > 0) {
      console.log(`⚠️ Marked ${expiringTodayResult.modifiedCount} subscriptions as expiring today`);
    }

    // Debug: Check final counts
    const counts = await GymUsers.aggregate([
      {
        $group: {
          _id: "$subscription.status",
          count: { $sum: 1 }
        }
      }
    ]);

    console.log("📊 Final subscription status counts:");
    counts.forEach(status => {
      console.log(`  ${status._id || 'no status'}: ${status.count}`);
    });

    // Debug: Check users that should be expired but aren't
    const shouldBeExpired = await GymUsers.find({
      "subscription.endDate": { $lt: today },
      "subscription.status": { $ne: "expired" }
    }).limit(5).lean();

    if (shouldBeExpired.length > 0) {
      console.log("⚠️ Users that should be expired but aren't:");
      shouldBeExpired.forEach(user => {
        console.log(`  ${user.name}: endDate=${user.subscription?.endDate}, status=${user.subscription?.status}`);
      });
    }

    
  } catch (err) {
    console.error("❌ Error updating subscription statuses:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
  }
});

// Also run once immediately when server starts to fix any existing issues
(async () => {
 
  
  try {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fix date types first
    await GymUsers.updateMany(
      { "subscription.endDate": { $type: "string" } },
      [{ $set: { 
        "subscription.endDate": { 
          $dateFromString: { dateString: "$subscription.endDate" } 
        }
      }}]
    ).catch(err => console.log("No string dates to convert"));
    
    // Mark expired
    const expiredResult = await GymUsers.updateMany(
      { "subscription.endDate": { $lt: today } },
      { $set: { "subscription.status": "expired" } }
    );
    
    // Mark active
    await GymUsers.updateMany(
      { 
        "subscription.startDate": { $lte: now }, 
        "subscription.endDate": { $gte: now } 
      },
      { $set: { "subscription.status": "active" } }
    );
    
  } catch (err) {
    console.error("❌ Initial check failed:", err);
  }
})();
