import random
import boto3

# Initialize the DynamoDB client
dynamodb = boto3.client('dynamodb')


def lambda_handler(event, context):
    """
    Lambda function to retrieve a random security question for a given user.

    Parameters:
        event (dict): A dictionary representing the Lambda event containing the request data.
        context (object): The Lambda context object.

    Returns:
        dict: A dictionary containing the response status code, status, and the random security question (if available).
    """

    # Retrieve the request body
    request_data = event['body']

    # Get user ID and security question from the request
    user_details = request_data.get('user_details')

    # Retrieve security questions and answers from DynamoDB
    response = dynamodb.get_item(
        TableName='securityanswer',
        Key={'uid': {'S': user_details['user_id']}}
    )
    security_answers = response.get('Item', {}).get('security_questions', {}).get('L', [])

    # Get a random security question
    if security_answers:
        random_question = random.choice(security_answers)
        question = random_question['M']['question']['S']
        return {'statusCode': 200, 'status': True, 'response': question}
    else:
        return {'statusCode': 404, 'status': False, 'response': 'No security questions found.'}

'''
References:

[1]	“AWS Lambda”, 2023. https://docs.aws.amazon.com/lambda/index.html (accessed Aug. 05, 2023).

[2]	“Documentation,” Firebase, 2023. https://firebase.google.com/docs (accessed Aug. 05, 2023).

[3]	“Amazon DynamoDB”, 2023. https://docs.aws.amazon.com/dynamodb/index.html (accessed Aug. 05, 2023).

'''