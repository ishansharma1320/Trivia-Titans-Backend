import firebase_admin
from firebase_admin import credentials, firestore
from flask import jsonify

# Initialize Firebase Admin SDK with credentials
cred = credentials.Certificate('sdpproject-b53f8-firebase-adminsdk-rmwnq-781363c1c6.json')
firebase = firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()


def update_user_details_by_uid(request):
    """
    Update user details in Firestore based on the provided UID.

    Args:
        request (flask.Request): The HTTP request object containing user details in JSON format.

    Returns:
        flask.Response: A JSON response indicating the status of the update operation.
            If successful, returns {"status": True, "response": "User details updated successfully."}
            If unsuccessful, returns {"status": False, "error": "Error message"} along with the corresponding HTTP status code.
    """
    try:
        # Get user details from the request
        request_data = request.get_json()
        uid = request_data.get('uid')
        username = request_data.get('username')
        email = request_data.get('email')
        gender = request_data.get('gender')
        dob = request_data.get('dob')
        city = request_data.get('city')
        country = request_data.get('country')
        profile_pic = request_data.get('profile_pic')

        # Update user document in Firestore
        user_ref = db.collection('users').document(uid)
        user_ref.update({
            'username': username,
            'email': email,
            'gender': gender,
            'dob': dob,
            'city': city,
            'country': country,
            'profile_pic': profile_pic
        })

        # Return a success response
        return jsonify({"status": True, "response": 'User details updated successfully.'}), 200

    except Exception as e:
        # Return an error response with the specific error message
        return jsonify({"status": False, 'error': str(e)}), 400

'''
References:

[1]	“AWS Lambda”, 2023. https://docs.aws.amazon.com/lambda/index.html (accessed Aug. 05, 2023).

[2]	“Documentation,” Firebase, 2023. https://firebase.google.com/docs (accessed Aug. 05, 2023).

[3]	“Amazon DynamoDB”, 2023. https://docs.aws.amazon.com/dynamodb/index.html (accessed Aug. 05, 2023).

'''