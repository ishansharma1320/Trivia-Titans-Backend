import boto3

# Initialize the DynamoDB client
dynamodb = boto3.client('dynamodb')


def lambda_handler(event, context):
    """
    Lambda function to register user security questions in DynamoDB.

    Parameters:
        event (dict): A dictionary representing the Lambda event containing the request data.
        context (object): The Lambda context object.

    Returns:
        dict: A dictionary containing the response status and a success or error message.
    """

    # Retrieve the request body
    request_data = event['body']

    # Extract the user ID and security questions from the request
    uid = request_data['uid']
    security_questions = request_data['security_questions']

    try:
        # Save security questions in DynamoDB
        dynamodb.put_item(
            TableName='securityanswer',
            Item={
                'uid': {'S': uid},
                'security_questions': {'L': security_questions}
            }
        )

        return {"status": True, "response": 'User registered successfully.'}

    except Exception as e:
        # Return error response if there is an exception
        return {'statusCode': 400, 'body': str(e)}


'''
References:

[1]	“AWS Lambda”, 2023. https://docs.aws.amazon.com/lambda/index.html (accessed Aug. 05, 2023).

[2]	“Documentation,” Firebase, 2023. https://firebase.google.com/docs (accessed Aug. 05, 2023).

[3]	“Amazon DynamoDB”, 2023. https://docs.aws.amazon.com/dynamodb/index.html (accessed Aug. 05, 2023).

'''