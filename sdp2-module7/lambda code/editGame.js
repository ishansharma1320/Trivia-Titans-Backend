const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const allowedOrigin = "*";

  const headers = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  try {
    const requestBody = JSON.parse(event.body);
    const gameId = requestBody.id;
    const getParams = {
      TableName: "gamedata",
      Key: { id: gameId },
    };

    const { Item: existingGame } = await dynamodb.get(getParams).promise();

    if (!existingGame) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Game not found." }),
      };
    }

    //setting up new values
    existingGame.category = requestBody.category;
    existingGame.difficulty = requestBody.difficulty;
    existingGame.duration = requestBody.duration;
    existingGame.numberOfQuestions = requestBody.numberOfQuestions;
    existingGame.questionIds = requestBody.questionIds;

    //definign parameters
    const putParams = {
      TableName: "gamedata",
      Item: existingGame,
    };

    await dynamodb.put(putParams).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ id: existingGame.id }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: "An error occurred.",
    };
  }
};
