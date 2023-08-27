exports.submitAnswer = functions.https.onCall(async (data, context) => {
    const { gameId, answer } = data;
    const userId = context.auth.uid;
  
    // 1. Retrieve game and question details
    const gameRef = admin.firestore().collection('games').doc(gameId);
    const gameSnapshot = await gameRef.get();
  
    if (!gameSnapshot.exists) {
      return { success: false, message: 'Game not found' };
    }
  
    const gameData = gameSnapshot.data();
    const currentQuestionIndex = gameData.currentQuestionIndex;
    const question = gameData.questions[currentQuestionIndex];
  
    // Check if the time frame for answering this question has elapsed
    const questionStartTime = gameData.startTime.toDate();
    const currentTime = admin.firestore.Timestamp.now().toDate();
    const timeElapsed = (currentTime - questionStartTime) / 1000; // in seconds
  
    if (timeElapsed > question.timeLimit) {
      return { success: false, message: 'Time has elapsed for this question' };
    }
  
    // 2. Check if the answer is correct
    const isCorrect = question.correctAnswer === answer;
  
    // 3. Update participant's score
    if (isCorrect) {
      const newScore = (gameData.scores[userId] || 0) + question.points;
      await gameRef.update({
        [`scores.${userId}`]: newScore
      });
    }
  
    return { success: true, isCorrect };
  });
  