# API Documentation - SDP Module 1

This documentation provides an overview of the APIs available in SDP Module 1. These APIs allow users to interact with various endpoints for user registration, authentication, password reset, and user information retrieval. The following sections describe each API endpoint and provide details about the required request body.

---

## API Endpoints

### 1. Reset Password

- **Endpoint**: `POST /resetpassword`
- **Description**: Resets the user's password by providing the user ID (`uid`) and email (`email`) in the request body.
- **Request Body**:
  ```json
  {
    "uid": "uid",
    "email": "email"
  }

### 2. Get Question

- **Endpoint**: `POST /get/question`
- **Description**: Retrieves a security question for the user identified by the user ID (`uid`).
- **Request Body**:
  ```json
  {
    "uid": "uid"
  }

### 3. Check Answer

- **Endpoint**: `POST /checkanswer`
- **Description**: Verifies the user's answer to a security question.
- **Request Body**:
  ```json
  {
    "uid": "uid",
    "question": "question",
    "answer": "answer"
  }

### 4. Login with Email

- **Endpoint**: `POST /login/email`
- **Description**: Authenticates the user by email and password.
- **Request Body**:
  ```json
  {
    "email": "email",
    "password": "password"
  }

### 5. Get User by Email

- **Endpoint**: `POST /getuser/email`
- **Description**: Retrieves user information based on the provided email address.
- **Request Body**:
  ```json
  {
    "email": "email"
  }

### 6. Register with Third Party

- **Endpoint**: `POST /register/thirdparty`
- **Description**: Registers a user using third-party authentication details.
- **Request Body**:
  ```json
  {
    "username": "username",
    "email": "email",
    "gender": "",
    "dob": "",
    "city": "",
    "country": "",
    "profile_pic": "profile_pic_url",
    "uid": "uid"
  }

## 7. Verify Token

- **Endpoint**: `POST /verifytoken`
- **Description**: Verifies the authenticity of a user token.
- **Request Body**:
  ```json
  {
    "token": "token"
  }

## 8. Logout

- **Endpoint**: `POST /logout`
- **Description**: Logs out the user by invalidating the provided token.
- **Request Body**:
  ```json
  {
    "token": "token"
  }
