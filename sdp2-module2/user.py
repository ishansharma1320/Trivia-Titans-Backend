import firebase_admin
import pyrebase
from firebase_admin import credentials, firestore
from flask import Flask, request, jsonify, json

# App configuration
app = Flask(__name__)

# Connect to firebase
cred = credentials.Certificate('sdpproject-b53f8-firebase-adminsdk-rmwnq-781363c1c6.json')
firebase = firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()


@app.route('/getuser/email', methods=['POST'])
def get_user_details_by_email():
    # get email from request
    email = request.get_json().get('email')
    try:
        # Query user document in Firestore based on email
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).get()

        user_details = {}
        for user in query:
            user_details['user_id'] = user.id
            user_details['username'] = user.get('username')
            user_details['email'] = user.get('email')
            user_details['gender'] = user.get('gender')
            user_details['dob'] = user.get('dob')
            user_details['city'] = user.get('city')
            user_details['country'] = user.get('country')
            user_details['profile_pic'] = user.get('profile_pic')

        if not user_details:
            return jsonify({"status": False, "response": 'User not found.'}), 404

        return jsonify(user_details), 200

    except Exception as e:
        print('Error:', str(e))


@app.route('/getuser/uid', methods=['POST'])
def get_user_details_by_uid():
    # get email from request
    uid = request.get_json().get('uid')
    try:
        # Query user document in Firestore based on email
        users_ref = db.collection('users')
        query = users_ref.where('uid', '==', uid).get()

        user_details = {}
        for user in query:
            user_details['user_id'] = user.id
            user_details['username'] = user.get('username')
            user_details['email'] = user.get('email')
            user_details['gender'] = user.get('gender')
            user_details['dob'] = user.get('dob')
            user_details['city'] = user.get('city')
            user_details['country'] = user.get('country')
            user_details['profile_pic'] = user.get('profile_pic')

        if not user_details:
            return jsonify({"status": False, "response": 'User not found.'}), 404

        return jsonify(user_details), 200

    except Exception as e:
        print('Error:', str(e))


@app.route('/updateuser/uid', methods=['POST'])
def update_user_details_by_uid():
    # Get user details from request
    request_data = request.get_json()
    uid = request_data.get('uid')
    username = request_data.get('username')
    email = request_data.get('email')
    gender = request_data.get('gender')
    dob = request_data.get('dob')
    city = request_data.get('city')
    country = request_data.get('country')
    profile_pic = request_data.get('profile_pic')

    try:
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

        return jsonify({"status": True, "response": 'User details updated successfully.'}), 200

    except Exception as e:
        return jsonify({"status": False, 'error': str(e)}), 400


if __name__ == '__main__':
    app.run()
