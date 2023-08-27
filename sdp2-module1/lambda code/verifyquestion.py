import boto3

# Initialize the DynamoDB client
dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    """
    Lambda function to verify the user's security question answer.

    Parameters:
        event (dict): A dictionary representing the Lambda event containing the request data.
        context (object): The Lambda context object.

    Returns:
        dict: A dictionary containing the response status and a success or error message.
    """

    # Retrieve the request body
    request_data = event['body']

    # Get user ID, security question, and answer from the request
    uid = request_data.get('uid')
    question = request_data.get('question')
    answer = request_data.get('answer')

    try:
        # Retrieve security questions and answers from DynamoDB
        response = dynamodb.get_item(
            TableName='securityanswer',
            Key={'uid': {'S': uid}}
        )
        security_answers = response.get('Item', {}).get('security_questions', {}).get('L', [])

        # Check if the answer matches any of the stored answers
        for sq in security_answers:
            stored_question = sq['M']['question']['S']
            stored_answer = sq['M']['answer']['S']
            if question == stored_question and answer == stored_answer:
                return {'statusCode': 200, 'status': True, 'response': 'Answer is correct.'}

        return {'statusCode': 200, 'body': {'status': False, 'response': 'Answer is incorrect.'}}

    except Exception as e:
        # Return error response if there is an exception
        return {'statusCode': 400, 'body': {'status': False, 'response': str(e)}}


'''
References:

[1]	“AWS Lambda”, 2023. https://docs.aws.amazon.com/lambda/index.html (accessed Aug. 05, 2023).

[2]	“Documentation,” Firebase, 2023. https://firebase.google.com/docs (accessed Aug. 05, 2023).

[3]	“Amazon DynamoDB”, 2023. https://docs.aws.amazon.com/dynamodb/index.html (accessed Aug. 05, 2023).

'''