const axios = require("axios");

exports.handler = async (event) => {
  try {
    //triggering the cloud function
    const url =
      "https://us-east1-serverless-project-392203.cloudfunctions.net/utsav12198";
    const response = await axios.post(url, {});

    return {
      statusCode: 200,
      body: "Lambda function executed successfully.",
    };
  } catch (error) {
    console.error("Error:", error);

    return {
      statusCode: 500,
      body: "An error occurred.",
    };
  }
};
