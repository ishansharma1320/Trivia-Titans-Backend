exports.filterGames = functions.https.onCall((data, context) => {
    let query = admin.firestore().collection('games').where('status', '==', 'available');
  
    // Apply category filter if provided
    if (data.category) query = query.where('category', '==', data.category);
  
    // Apply difficulty filter if provided
    if (data.difficulty) query = query.where('difficulty', '==', data.difficulty);
  
    // Apply time frame filter if provided
    if (data.timeFrame) query = query.where('timeFrame', '==', data.timeFrame);
  
    return query.get().then(snapshot => {
      const games = [];
      snapshot.forEach(doc => games.push(doc.data()));
      return { games };
    })
    .catch(error => {
      return { success: false, message: error.message };
    });
  });
  