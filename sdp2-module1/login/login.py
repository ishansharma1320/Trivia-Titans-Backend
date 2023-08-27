import firebase_admin
import pyrebase
import requests
from firebase_admin import credentials, firestore, auth
from flask import Flask, request, jsonify, json
from flask_cors import CORS

# App configuration
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Connect to Firebase Admin SDK using the service account credentials
cred = credentials.Certificate('sdpproject-b53f8-firebase-adminsdk-rmwnq-781363c1c6.json')
firebase = firebase_admin.initialize_app(cred)

# Initialize Pyrebase with Firebase Web API configuration stored in 'config.json'
pb = pyrebase.initialize_app(json.load(open('config.json')))

# Initialize Firestore
db = firestore.client()

@app.route('/login/email', methods=['POST'])
def login_user_with_email():
    """
    Endpoint for user login using email and password.

    Request JSON format:
    {
        "email": "user@example.com",
        "password": "password123"
    }

    Returns:
        dict: A dictionary containing the user ID, email, token, and claim (admin or user).
              If successful, the status code will be 200.
              If unsuccessful, the status code will be 401 with an error message.
    """

    # Get email and password from request
    userdata = request.get_json()
    email = userdata.get('email')
    password = userdata.get('password')

    try:
        # Sign in user with email and password using Pyrebase
        user = pb.auth().sign_in_with_email_and_password(email, password)
        token = user['idToken']

        # Check if user is an admin (using Firebase custom claims)
        claims = auth.verify_id_token(token)
        if claims.get('admin', False):
            claim = 'admin'
        else:
            claim = 'user'

        # Return user ID, email, token, and claim as response
        response = {
            'uid': user['localId'],
            'email': user['email'],
            'token': user['idToken'],
            'claim': claim
        }

        return jsonify(response), 200

    except Exception as e:
        # Handle different authentication errors and return appropriate responses
        error_data = json.loads(e.args[1])
        message_value = error_data["error"]["message"]
        if message_value == 'INVALID_PASSWORD':
            return jsonify({'error': 'Invalid password.'}), 401
        elif message_value == 'EMAIL_NOT_FOUND':
            return jsonify({'error': 'Email not found.'}), 401
        elif message_value == 'USER_DISABLED':
            return jsonify({'error': 'User disabled.'}), 401
        else:
            return jsonify({'error': message_value}), 401



@app.route('/check/claim', methods=['POST'])
def check_claim():
    """
    Endpoint to check if the user has admin claim.

    Request JSON format:
    {
        "token": "firebase_id_token"
    }

    Returns:
        dict: A dictionary containing the user claim (admin or user).
              If successful, the status code will be 200.
              If unsuccessful, the status code will be 401 with an error message.
    """
    # Get uid from request
    token = request.get_json().get('token')

    try:
        # Check if user is an admin (using Firebase custom claims)
        claims = auth.verify_id_token(token)
        if claims.get('admin', False):
            claim = 'admin'
        else:
            claim = 'user'
        return jsonify({'claim': claim}), 200

    except Exception as e:
        # Handle verification errors and return appropriate responses
        return jsonify({'error': str(e)}), 401


@app.route('/logout', methods=['POST'])
def logout_user_with_email():
    """
    Endpoint to logout the user and blacklist their token.

    Request JSON format:
    {
        "token": "firebase_id_token"
    }

    Returns:
        dict: A dictionary containing the status and response message.
              If successful, the status code will be 200.
              If unsuccessful, the status code will be 500 with an error message.
    """
    # Get id token from request
    userdata = request.get_json()
    id_token = userdata.get('token')

    try:
        # Save the user's id token to the "blacklistedtokens" collection in Firestore
        user_ref = db.collection('blacklistedtokens').document(id_token)
        user_ref.set({'id_token': id_token})
        return jsonify({"status": True, "response": "User logged out successfully."}), 200

    except Exception as e:
        # Handle any exceptions during the logout process and return appropriate responses
        return jsonify({"status": False, "error": str(e)}), 500


@app.route('/checkanswer', methods=['POST'])
def check_answer():
    """
    Endpoint to check the user's security question answer.

    Request JSON format:
    {
        "uid": "user_id",
        "question": "security_question",
        "answer": "user_answer"
    }

    Returns:
        dict: A dictionary containing the status and response from the Lambda function.
              If successful, the status code will be 200.
              If unsuccessful, the status code will be 400 with an error message.
    """
    request_data = request.get_json()
    uid = request_data.get('uid')
    question = request_data.get('question')
    answer = request_data.get('answer')

    try:
        # Query user document in Firestore based on the user's UID
        users_ref = db.collection('users')
        query = users_ref.where('uid', '==', uid).get()

        user_details = {}
        for user in query:
            user_details['user_id'] = user.id

        # Call the Lambda function and pass user_details['user_id'], question, and answer as parameters
        lambda_url = "https://prjap4iaq7.execute-api.us-east-1.amazonaws.com/prod/checkanswer"
        payload = {'uid': user_details['user_id'], 'question': question, 'answer': answer}
        headers = {'Content-Type': 'application/json'}
        response = requests.post(lambda_url, data=json.dumps(payload), headers=headers)

        return response.json(), 200

    except Exception as e:
        # Handle any exceptions during the process and return appropriate responses
        print('Error:', str(e))
        return jsonify({'status': False, 'response': str(e)}), 400


@app.route('/get/question', methods=['POST'])
def get_question():
    """
    Endpoint to get a security question for the user.

    Request JSON format:
    {
        "uid": "user_id"
    }

    Returns:
        dict: A dictionary containing the security question response from the Lambda function.
              If successful, the status code will be 200.
              If unsuccessful, the status code will be 400 with an error message.
    """
    # Get UID from request
    uid = request.get_json().get('uid')

    try:
        # Query user document in Firestore based on the user's UID
        users_ref = db.collection('users')
        query = users_ref.where('uid', '==', uid).get()

        user_details = {}
        # Get user ID from query result
        for user in query:
            user_details['user_id'] = user.id

        # Call the Lambda function and pass user_details['user_id'] as a parameter
        lambda_url = 'https://prjap4iaq7.execute-api.us-east-1.amazonaws.com/prod/get/question'
        payload = {'user_details': {'user_id': user_details['user_id']}}
        headers = {'Content-Type': 'application/json'}
        response = requests.post(lambda_url, data=json.dumps(payload), headers=headers)

        return response.json(), 200

    except Exception as e:
        # Handle any exceptions during the process and return appropriate responses
        return jsonify({'status': False, 'error': str(e)}), 400


@app.route('/resetpassword', methods=['POST'])
def reset_password():
    """
    Endpoint to send a password reset link to the user's email.

    Request JSON format:
    {
        "uid": "user_id",
        "email": "user@example.com"
    }

    Returns:
        dict: A dictionary containing the status and response.
              If successful, the status code will be 200.
              If email not found, the status code will be 404.
              If unsuccessful, the status code will be 400 with an error message.
    """
    # Get UID and email from request
    uid = request.json.get('uid')
    email = request.json.get('email')

    # Check if email exists in the database
    users_ref = db.collection('users')
    query = users_ref.where('uid', '==', uid).get()
    if len(query) == 0:
        return jsonify({'status': False, 'response': 'Email not found.'}), 404

    try:
        # Send password reset link to the user's email using Pyrebase
        pb.auth().send_password_reset_email(email)

        return jsonify({'status': True, 'response': 'Password reset link sent successfully.'}), 200

    except Exception as e:
        # Handle any exceptions during the process and return appropriate responses
        return jsonify({'status': False, 'error': str(e)}), 400


@app.route('/verifytoken', methods=['POST'])
def verify_token():
    """
    Endpoint to verify the validity of a user's Firebase ID token.

    Request JSON format:
    {
        "token": "firebase_id_token"
    }

    Returns:
        dict: A dictionary containing the status, response, and user UID if the token is valid.
              If the token is blacklisted or invalid, the status code will be 401.
              If the token is valid, the status code will be 200.
    """
    # Get token from request
    token = request.json.get('token')

    try:
        # Check if the token exists in the blacklistedtokens collection
        blacklisted_token_ref = db.collection('blacklistedtokens').document(token).get()
        if blacklisted_token_ref.exists:
            return jsonify({"status": False, "error": "Invalid token."}), 401

        # Verify the token using Firebase Admin SDK
        token_status = auth.verify_id_token(token)

        # If the UID is present, the token is valid
        if token_status.get('uid'):
            return jsonify({'status': True, 'response': 'Token is valid.', 'uid': token_status['uid']}), 200

    except Exception:
        # If there are any exceptions during the token verification process, consider the token invalid
        return jsonify({'status': False, 'response': 'Token is invalid.'}), 401


if __name__ == '__main__':
    app.run(port=5100, debug=True)


'''
References:

[1]	“AWS Lambda”, 2023. https://docs.aws.amazon.com/lambda/index.html (accessed Aug. 05, 2023).

[2]	“Documentation,” Firebase, 2023. https://firebase.google.com/docs (accessed Aug. 05, 2023).

[3]	“Amazon DynamoDB”, 2023. https://docs.aws.amazon.com/dynamodb/index.html (accessed Aug. 05, 2023).

'''