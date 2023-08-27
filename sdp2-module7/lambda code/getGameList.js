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
    const gameParams = {
      TableName: "gamedata",
      ProjectionExpression:
        "id, category, difficulty, gameName, numberOfQuestions, #dur ,#interval",
      ExpressionAttributeNames: {
        "#dur": "duration",
        "#interval": "interval",
      },
    };

    const gameQueryResult = await dynamodb.scan(gameParams).promise();
    const games = gameQueryResult.Items;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(games),
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
