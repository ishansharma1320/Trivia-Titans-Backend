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
    //parsing the request body
    const requestBody = JSON.parse(event.body);
    const category = requestBody.category;
    const difficulty = requestBody.difficulty;
    const duration = requestBody.duration;
    const numberOfQuestions = requestBody.numberOfQuestions;
    const questionIds = requestBody.questionIds;
    const gameName = requestBody.gameName;
    const interval = requestBody.interval;

    const id = Date.now().toString();

    //creating new item for game
    const newItem = {
      id: id,
      gameName: gameName,
      category: category,
      difficulty: difficulty,
      duration: duration,
      numberOfQuestions: numberOfQuestions,
      questionIds: questionIds,
      interval: parseInt(requestBody.interval),
    };

    const putParams = {
      TableName: "gamedata",
      Item: newItem,
    };

    await dynamodb.put(putParams).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ id }),
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
