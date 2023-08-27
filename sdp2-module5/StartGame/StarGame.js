const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.startGame = functions.https.onCall(async (data, context) => {
  const { gameId } = data;

  // 1. Retrieve game details
  const gameRef = admin.firestore().collection('games').doc(gameId);
  const gameSnapshot = await gameRef.get();
  if (!gameSnapshot.exists) {
    return { success: false, message: 'Game not found' };
  }

  const questionsRef = admin.firestore().collection('questions');
  const questionsSnapshot = await questionsRef.where('gameId', '==', gameId).get();
  const questions = [];
  questionsSnapshot.forEach(doc => questions.push(doc.data()));

  if (questions.length === 0) {
    return { success: false, message: 'No questions found for this game' };
  }

  // 2. Set game state
  const gameState = {
    status: 'started',
    currentQuestionIndex: 0,
    startTime: admin.firestore.Timestamp.now(),
    questions,
  };

  await gameRef.update(gameState);

  
  
  return { success: true };
});
