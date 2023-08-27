exports.joinGame = functions.https.onCall((data, context) => {
    const { gameId } = data;
    const userId = context.auth.uid;
  
    // Reference to the game document
    const gameRef = admin.firestore().collection('games').doc(gameId);
  
    return admin.firestore().runTransaction(transaction => {
      return transaction.get(gameRef).then(doc => {
        if (!doc.exists) {
          throw new functions.https.HttpsError('not-found', 'Game not found');
        }
  
        const game = doc.data();
  
        // Check if the game is already full
        if (game.participants.length >= game.maxParticipants) {
          throw new functions.https.HttpsError('failed-precondition', 'Game is already full');
        }
  
        // Check if the user is already in the game
        if (game.participants.includes(userId)) {
          throw new functions.https.HttpsError('already-exists', 'User is already in the game');
        }
  
        // Add the user to the participants and increment the count
        game.participants.push(userId);
        transaction.update(gameRef, {
          participants: game.participants,
          numberOfParticipants: admin.firestore.FieldValue.increment(1)
        });
      });
    })
    .then(() => {
      return { success: true, message: 'Successfully joined the game!' };
    })
    .catch(error => {
      return { success: false, message: error.message };
    });
  });
  