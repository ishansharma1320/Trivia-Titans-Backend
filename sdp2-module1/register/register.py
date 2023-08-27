import base64
import io
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

# Connect to Firebase
cred = credentials.Certificate('sdpproject-b53f8-firebase-adminsdk-rmwnq-781363c1c6.json')
firebase = firebase_admin.initialize_app(cred)
pb = pyrebase.initialize_app(json.load(open('config.json')))

# Initialize Firestore
db = firestore.client()

# API route for user registration using email and password
@app.route('/register/email', methods=['POST'])
def register_user():
    """
    Endpoint to register a user using email and password.

    Request JSON format:
    {
        "username": "user123",
        "email": "user@example.com",
        "password": "password123",
        "gender": "male",
        "dob": "2000-01-01",
        "city": "New York",
        "country": "USA",
        "profile_pic": "profile_pic_url",
        "security_questions": [
            {
                "question": "What is your favorite color?",
                "answer": "Blue"
            },
            {
                "question": "What is your pet's name?",
                "answer": "Buddy"
            }
        ]
    }

    Returns:
        dict: A dictionary containing the registration status and response.
              If successful, the status code will be 200.
              If the email already exists, the status code will be 400 with an error message.
              If unsuccessful, the status code will be 400 with an error message.
    """
    # Get user details from JSON request
    user_data = request.get_json()
    username = user_data.get('username')
    email = user_data.get('email')
    password = user_data.get('password')
    gender = user_data.get('gender')
    dob = user_data.get('dob')
    city = user_data.get('city')
    country = user_data.get('country')
    profile_pic = user_data.get('profile_pic')
    security_questions = user_data.get('security_questions')

    try:
        # Create admin user in Firebase Authentication
        if email.lower() == 'admin@firebase.com' and username.lower() == 'admin':
            user = auth.create_user(
                email=email,
                password=password,
                display_name=username
            )
            auth.set_custom_user_claims(user.uid, {'admin': True})
        else:
            # Create user in Firebase Authentication
            user = auth.create_user(
                email=email,
                password=password,
                display_name=username
            )
            auth.set_custom_user_claims(user.uid, {'admin': False})

        # Create user document in Firestore
        user_ref = db.collection('users').document(user.uid)
        user_ref.set({
            'uid': user.uid,
            'username': username,
            'email': email,
            'gender': gender,
            'dob': dob,
            'city': city,
            'country': country,
            'profile_pic': profile_pic,
            'claim': 'user'
        })

        # Prepare security questions and answers
        security_question_items = []
        for sq in security_questions:
            question = sq['question']
            answer = sq['answer']
            security_question_items.append({
                'M': {
                    'question': {'S': question},
                    'answer': {'S': answer}
                }
            })

        # Call the Lambda function and pass user details and security questions
        lambda_url = "https://prjap4iaq7.execute-api.us-east-1.amazonaws.com/prod/storesecurityquestions"
        payload = {'uid': user.uid, 'security_questions': security_question_items}
        headers = {'Content-Type': 'application/json'}
        response = requests.post(lambda_url, data=json.dumps(payload), headers=headers)

        return response.json(), 200

    except Exception as e:
        errormessage = str(e)
        if 'EMAIL_EXISTS' in errormessage:
            return jsonify({"status": False, "response": 'Email already exists.'}), 400
        return jsonify({"status": False, 'error': str(e)}), 400


# API route for user registration using third-party providers (e.g., Google)
@app.route('/register/thirdparty', methods=['POST'])
def register_user_google():
    """
    Endpoint to register a user using third-party providers (e.g., Google).

    Request JSON format:
    {
        "username": "user123",
        "email": "user@example.com",
        "gender": "male",
        "dob": "2000-01-01",
        "city": "New York",
        "country": "USA",
        "profile_pic": "profile_pic_url",
        "uid": "user_google_uid"
    }

    Returns:
        dict: A dictionary containing the registration status and response.
              If successful, the status code will be 200.
              If unsuccessful, the status code will be 400 with an error message.
    """
    # Get user details from JSON request
    user_data = request.get_json()
    username = user_data.get('username')
    email = user_data.get('email')
    gender = user_data.get('gender')
    dob = user_data.get('dob')
    city = user_data.get('city')
    country = user_data.get('country')
    profile_pic = user_data.get('profile_pic')
    uid = user_data.get('uid')

    response = requests.get(profile_pic)

    # Read the response content as bytes
    image_bytes = response.content

    # Create an in-memory binary stream
    stream = io.BytesIO(image_bytes)

    # Read the stream as a base64-encoded string
    base64_data = base64.b64encode(stream.read()).decode('utf-8')

    # Create the data URI string with the appropriate MIME type
    data_uri = f"data:image/png;base64,{base64_data}"

    auth.set_custom_user_claims(uid, {'admin': False})

    try:
        user_ref = db.collection('users').document(uid)
        user_ref.set({
            'uid': uid,
            'username': username,
            'email': email,
            'gender': gender,
            'dob': dob,
            'city': city,
            'country': country,
            'profile_pic': data_uri
        })

        return jsonify({"status": True, "response": 'User registered successfully.'}), 200
    except Exception as e:
        return jsonify({"status": False, 'error': str(e)}), 400


if __name__ == '__main__':
    app.run()


'''
References:

[1]	“AWS Lambda”, 2023. https://docs.aws.amazon.com/lambda/index.html (accessed Aug. 05, 2023).

[2]	“Documentation,” Firebase, 2023. https://firebase.google.com/docs (accessed Aug. 05, 2023).

[3]	“Amazon DynamoDB”, 2023. https://docs.aws.amazon.com/dynamodb/index.html (accessed Aug. 05, 2023).

'''