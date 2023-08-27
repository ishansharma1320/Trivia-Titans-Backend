# API Documentation - SDP Module 7

This documentation provides an overview of the APIs available in SDP Module 7. These APIs allow users to interact with various endpoints for question management (create, edit, delete), game management The following sections describe each API endpoint and provide details about the required request body.

---

## API Endpoints

### 1. Add Question

- **Endpoint**: `POST /prod/question`
- **Description**: adds a new question to DynamoDB.
- **Request Body**:
  ```json
  {
    {
      "question": "In soccer, which country won the FIFA World Cup in 2018?? ",
      "options": [
        "Brazil",
        "Germany",
        "France",
        "Italy"
      ],
      "answer": "Germany",
      "difficulty": "medium",
      "category": "Sports"
    }
  }

### 2. Edit Question

- **Endpoint**: `POST /prod/edit`
- **Description**: edit existing question from DynamoDB.
- **Request Body**:
  ```json
  {
  "id": "1691014160568",
  "question": "What is your question?",
  "options": ["Option 1", "Option 2", "Option 3"],
  "answer": "Option 2",
  "difficulty": "medium",
  "category": "Science"
   }
### 3. Delete Question

- **Endpoint**: `POST /prod/delete`
- **Description**: delete the existing question from database.
- **Request Body**:
  ```json
  {
    "id" : "1691096199565"
  }
### 4. Get all questions

- **Endpoint**: `POST /prod/getallquestions`
- **Description**: Display all the questions from the DynamoDB table.

### 5. Create Game

- **Endpoint**: `POST /prod/creategame`
- **Description**: creates a new game and store into DynamoDB.
- **Request Body**:
  ```json
  {
  "category": "Techology",
  "gameName": "Technology Test",
  "difficulty": "hard",
  "duration": 10,
  "numberOfQuestions": 10,
  "questionIds": ["1691014160568", "1689307003043"]
  }
  
### 6. Edit game

- **Endpoint**: `POST /prod/editgame`
- **Description**: edits an existing game.
- **Request Body**:
  ```json
  {
  "id": "1691016223763",    
  "category": "Science",
  "difficulty": "hard",
  "duration": 5,
  "numberOfQuestions": 5,
  "questionIds": ["1691014235677", "1691008747554"]
  }
## 7. Delete game

- **Endpoint**: `POST /prod/deletegame`
- **Description**: deletes an exisiting game.
- **Request Body**:
  ```json
  {
  "id": "1691016223763"  
  }
## 8. Get list of exisiting games

- **Endpoint**: `GET /prod/getgamelist`
- **Description**: return list of existing games.


## 9. Get game data based on category and difficulty level

- **Endpoint**: `GET /prod/getgamedata`
- **Description**: returns the list of gamedata(questions) based on category and difficulty of the game.
- **Request Body**:
  ```json
  {
  "id": "1691016223763"  
  }

