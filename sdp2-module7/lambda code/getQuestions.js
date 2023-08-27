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
    const category = requestBody.category;
    const difficulty = requestBody.difficulty;

    const queryParams = {
      TableName: "questions",
      FilterExpression: "#cat = :category AND #dif = :difficulty",
      ExpressionAttributeNames: {
        "#cat": "category",
        "#dif": "difficulty",
      },
      ExpressionAttributeValues: {
        ":category": category,
        ":difficulty": difficulty,
      },
    };

    const queryResult = await dynamodb.scan(queryParams).promise();
    const questions = queryResult.Items.map((item) => ({
      id: item.id,
      question: item.question,
      difficulty: item.difficulty,
      tags: item.tag,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(questions),
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
