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
    // Parsing the request body to get the questions array
    const requestBody = JSON.parse(event.body);
    const questions = requestBody.questions;
    const responseIds = [];

    // Looping through each question object in the questions array
    for (const questionObj of questions) {
      const question = questionObj.question;
      const options = questionObj.options;
      const answer = questionObj.answer;
      const difficulty = questionObj.difficulty;
      const category = questionObj.category;

      const timestamp = Date.now().toString();
      responseIds.push(timestamp);

      // Creating a new item with the extracted data
      const newItem = {
        id: timestamp,
        question: question,
        options: options,
        answer: answer,
        category: category,
        difficulty: difficulty,
        tag: "",
      };

      // Defining the parameters for the put operation to add the new item to the DynamoDB table
      const putParams = {
        TableName: "questions",
        Item: newItem,
      };

      await dynamodb.put(putParams).promise();
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseIds),
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
