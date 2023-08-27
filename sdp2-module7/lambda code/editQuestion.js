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
    const questionId = requestBody.id;
    const question = requestBody.question;
    const options = requestBody.options;
    const answer = requestBody.answer;
    const difficulty = requestBody.difficulty;
    const category = requestBody.category;

    // Updating the question in the database
    const updateParams = {
      TableName: "questions",
      Key: { id: questionId },
      UpdateExpression:
        "SET question = :question, options = :options, answer = :answer, category = :category, difficulty = :difficulty",
      ExpressionAttributeValues: {
        ":question": question,
        ":options": options,
        ":answer": answer,
        ":category": category,
        ":difficulty": difficulty,
      },
      ReturnValues: "ALL_NEW",
    };

    const updateResult = await dynamodb.update(updateParams).promise();
    const updatedQuestion = updateResult.Attributes;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(updatedQuestion),
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
