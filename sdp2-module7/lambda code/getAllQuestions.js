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
    const queryParams = {
      TableName: "questions",
    };

    const queryResult = await dynamodb.scan(queryParams).promise();
    const formattedQuestions = queryResult.Items.map((item) => {
      const { id, question, difficulty, tag, options, answer } = item;

      return {
        questionId: id,
        questionText: question,
        category: difficulty,
        difficulty: difficulty,
        tags: tag,
        checked: false,
        questionAnswers: options.map((option) => ({
          answerText: option,
          isCorrect: option === answer,
        })),
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedQuestions),
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
