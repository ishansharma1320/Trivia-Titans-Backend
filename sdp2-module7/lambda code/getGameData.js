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
    //getting gamedata based on gameId
    const getParams = {
      TableName: "gamedata",
      Key: { id: gameId },
      ProjectionExpression: "id, category, difficulty, questionIds",
    };

    const { Item: game } = await dynamodb.get(getParams).promise();

    if (!game) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Game not found." }),
      };
    }

    const questionIds = game.questionIds;
    const response = [];

    for (const questionId of questionIds) {
      const getParams = {
        TableName: "questions",
        Key: { id: questionId },
      };

      const { Item: questionData } = await dynamodb.get(getParams).promise();

      if (questionData) {
        const { id, question, options, answer, tag } = questionData;

        //setting the format for response data
        const formattedQuestion = {
          questionId: id,
          questionText: question,
          category: game.category,
          difficulty: game.difficulty,
          tags: tag,
          checked: false,
          gameCount: 100,
          questionAnswers: options.map((option) => ({
            answerText: option,
            isCorrect: option === answer,
          })),
        };

        response.push(formattedQuestion);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
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
