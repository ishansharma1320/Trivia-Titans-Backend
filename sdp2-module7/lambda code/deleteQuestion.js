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

    //setting the question id for the question to be deleted
    const deleteParams = {
      TableName: "questions",
      Key: { id: questionId },
    };
    await dynamodb.delete(deleteParams).promise();

    return {
      statusCode: 200,
      headers,
      body: `Question with ID ${questionId} deleted successfully.`,
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
