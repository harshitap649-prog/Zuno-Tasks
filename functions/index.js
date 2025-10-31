const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// Daily reset of watch count for all users
exports.resetDailyWatchCount = functions.pubsub
  .schedule('0 0 * * *') // Run at midnight every day
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    console.log('Running daily watch count reset...');
    
    try {
      const usersSnapshot = await db.collection('users').get();
      const batch = db.batch();
      let count = 0;

      usersSnapshot.forEach((userDoc) => {
        batch.update(userDoc.ref, {
          watchCount: 0,
          lastWatchReset: admin.firestore.FieldValue.serverTimestamp(),
        });
        count++;
      });

      await batch.commit();
      console.log(`Reset watch count for ${count} users`);
      return null;
    } catch (error) {
      console.error('Error resetting watch count:', error);
      return null;
    }
  });

// Postback endpoint for offer completion verification
exports.verifyOfferPostback = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Security: Verify postback using secret key
  const secretKey = req.query.secret || req.body.secret;
  const expectedSecret = 'YOUR_SECRET_KEY'; // Set this in Firebase environment variables

  if (secretKey !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { userId, offerId, rewardPoints, hash } = req.body;

    // Verify hash if provided (for additional security)
    // This is a simple example - implement proper hash verification based on your offerwall provider

    if (!userId || !rewardPoints) {
      res.status(400).json({ error: 'Missing required parameters' });
      return;
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userData = userDoc.data();

    // Check if user is banned
    if (userData.banned) {
      res.status(403).json({ error: 'User is banned' });
      return;
    }

    // Prevent duplicate completions (optional: check taskHistory)
    // You can implement a check here to prevent the same offer from being completed twice

    // Update user points
    const newPoints = userData.points + parseInt(rewardPoints);
    const newTotalEarned = userData.totalEarned + parseInt(rewardPoints);

    await userRef.update({
      points: newPoints,
      totalEarned: newTotalEarned,
    });

    // Add transaction
    await db.collection('transactions').add({
      userId: userId,
      offerId: offerId || null,
      type: 'task',
      points: parseInt(rewardPoints),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log task completion
    await db.collection('taskHistory').add({
      userId: userId,
      offerId: offerId || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.ip || 'unknown',
    });

    console.log(`Postback processed: User ${userId} earned ${rewardPoints} points`);
    res.status(200).json({ success: true, message: 'Points added successfully' });
  } catch (error) {
    console.error('Error processing postback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manual task verification endpoint (for admin use)
exports.manualTaskVerification = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth || context.auth.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { userId, rewardPoints } = data;

  if (!userId || !rewardPoints) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const newPoints = userData.points + parseInt(rewardPoints);
    const newTotalEarned = userData.totalEarned + parseInt(rewardPoints);

    await userRef.update({
      points: newPoints,
      totalEarned: newTotalEarned,
    });

    await db.collection('transactions').add({
      userId: userId,
      type: 'task',
      points: parseInt(rewardPoints),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, newPoints };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

