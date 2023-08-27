# Importing necessary libraries
import firebase_admin
from firebase_admin import credentials, firestore
from flask import jsonify

# Setting up firebase credentials
cred = credentials.Certificate('sdpproject-b53f8-firebase-adminsdk-rmwnq-781363c1c6.json')
firebase = firebase_admin.initialize_app(cred)  # Initializing Firebase app

# Initializing Firestore client
db = firestore.client()

# Function to get user details based on UID
def get_user_details_by_uid(request):
    """
    This function takes a request as input which should contain a json object with a 'uid' field.
    It then queries the Firestore database to find a user with the matching uid.
    If such a user is found, it returns a json object with the user's details and a 200 HTTP status code.
    If no user is found, it returns a json object with an error message and a 404 HTTP status code.
    If any other exception is encountered during the process, it simply prints the error message.

    :param request: flask.Request object containing a json with 'uid'
    :return: flask.Response object containing a json with user details or error message and a HTTP status code
    """

    # Getting uid from request
    uid = request.get_json().get('uid')
    try:
        # Querying user document in Firestore based on uid
        users_ref = db.collection('users')
        query = users_ref.where('uid', '==', uid).get()

        user_details = {}
        # Parsing user details
        for user in query:
            user_details['user_id'] = user.id
            user_details['username'] = user.get('username')
            user_details['email'] = user.get('email')
            user_details['gender'] = user.get('gender')
            user_details['dob'] = user.get('dob')
            user_details['city'] = user.get('city')
            user_details['country'] = user.get('country')
            user_details['profile_pic'] = user.get('profile_pic')

        # Checking if any user was found
        if not user_details:
            return jsonify({"status": False, "response": 'User not found.'}), 404  # If no user found, returning 404

        return jsonify(user_details), 200  # If user found, returning user details and 200

    except Exception as e:
        print('Error:', str(e))  # Printing any other exception that might occur
        
        
        
'''
References:

[1]	“AWS Lambda”, 2023. https://docs.aws.amazon.com/lambda/index.html (accessed Aug. 05, 2023).

[2]	“Documentation,” Firebase, 2023. https://firebase.google.com/docs (accessed Aug. 05, 2023).

[3]	“Amazon DynamoDB”, 2023. https://docs.aws.amazon.com/dynamodb/index.html (accessed Aug. 05, 2023).

'''