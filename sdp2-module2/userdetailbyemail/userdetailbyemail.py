# Import the necessary modules
import firebase_admin
from firebase_admin import credentials, firestore
from flask import jsonify

# Establish Firebase credentials using the private key file
cred = credentials.Certificate('sdpproject-b53f8-firebase-adminsdk-rmwnq-781363c1c6.json')

# Initialize the Firebase admin SDK with the generated credentials
firebase = firebase_admin.initialize_app(cred)

# Initialize Firestore with the Firebase app
db = firestore.client()

def get_user_details_by_email(request):
    """
    Function to get a user's details by email from Firestore.
    
    Args:
    request: HTTP request object, expected to contain JSON with 'email' key
    
    Returns:
    A JSON response with the user's details if the user is found. 
    If no user is found, returns a 404 HTTP response with an error message. 
    If there's an exception during the operation, the exception is logged.
    """
    
    # Extract email from incoming request JSON
    email = request.get_json().get('email')
    try:
        # Query Firestore for a user document that matches the provided email
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).get()

        # Dictionary to store user details
        user_details = {}

        # Loop through the query result to extract user details
        for user in query:
            user_details['user_id'] = user.id
            user_details['username'] = user.get('username')
            user_details['email'] = user.get('email')
            user_details['gender'] = user.get('gender')
            user_details['dob'] = user.get('dob')
            user_details['city'] = user.get('city')
            user_details['country'] = user.get('country')
            user_details['profile_pic'] = user.get('profile_pic')

        # If user_details is still empty, no user was found
        if not user_details:
            return jsonify({"status": False, "response": 'User not found.'}), 404

        # Return the user details as a JSON response
        return jsonify(user_details), 200

    except Exception as e:
        # If there's an error during the operation, log it
        print('Error:', str(e))
        
        
'''
References:

[1]	“AWS Lambda”, 2023. https://docs.aws.amazon.com/lambda/index.html (accessed Aug. 05, 2023).

[2]	“Documentation,” Firebase, 2023. https://firebase.google.com/docs (accessed Aug. 05, 2023).

[3]	“Amazon DynamoDB”, 2023. https://docs.aws.amazon.com/dynamodb/index.html (accessed Aug. 05, 2023).

'''