const AWS = require("aws-sdk");
const { LanguageServiceClient } = require("@google-cloud/language");

const awsConfig = {
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
  sessionToken: process.env.aws_session_token,
  region: "us-east-1",
};

AWS.config.update(awsConfig);

const languageClient = new LanguageServiceClient();
const dynamodb = new AWS.DynamoDB();

exports.tagCategory = async (req, res) => {
  try {
    const tableName = "questions";
    const columnNames = ["id", "question", "tag"];

    // Quering DynamoDB table to extract desired column data
    const params = {
      TableName: tableName,
      ProjectionExpression: columnNames.join(", "),
    };

    const result = await dynamodb.scan(params).promise();
    const questionData = result.Items.map((item) => {
      return {
        id: item.id.S,
        question: item.question.S,
        tag: item.tag ? item.tag.S : null,
      };
    });

    // Processing and tagging each question
    for (const question of questionData) {
      if (question.tag) continue;

      const document = {
        content: question.question,
        type: "PLAIN_TEXT",
      };

      let topCategory = null;
      try {
        const [classification] = await languageClient.classifyText({
          document,
        });
        const categories = classification.categories;

        if (categories.length > 0) {
          topCategory = categories[0].name;
        }
      } catch (error) {
        topCategory = "unclassified";
      }

      const categoryParts = topCategory.split("/");
      const parentCategory = categoryParts[1];

      // Updating the question item in DynamoDB with the category
      const updateParams = {
        TableName: tableName,
        Key: {
          id: { S: question.id },
        },
        UpdateExpression: "SET #tag = :tag",
        ExpressionAttributeNames: { "#tag": "tag" },
        ExpressionAttributeValues: { ":tag": { SS: categoryParts } },
      };

      await dynamodb.updateItem(updateParams).promise();
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error extracting question data:", error);
    res.status(500).send("Error extracting question data ");
  }
};
