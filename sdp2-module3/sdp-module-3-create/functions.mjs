import {Team} from "./TeamsModel.mjs";
import {SendMessageBatchCommand} from "@aws-sdk/client-sqs";



export const pushMessagesToQueue = async (sqsClient, messages) =>{
    let response = {apiResponse: false, error: false}
    try{
        const command = new SendMessageBatchCommand(messages);
        response = await sqsClient.send(command);
    }catch(e){
        console.error(e);
        response.error = e;
    }
    
    return response;
}

export const createTeamName = async (openAIClient, existingTeamNames) => {
    let staticContent = `Create a unique team name for a trivia game and give response back in JSON only:
    Following JSON structure should be adhered:
    {"response": "<team_name>"}`;
    let content;
    if (Array.isArray(existingTeamNames) && existingTeamNames.length > 0) {
        content = `${staticContent}
    
    where the <team_name> cannot be the following:
    
    ${JSON.stringify(existingTeamNames)}
    `;
    } else {
        content = staticContent;
    }

    let response = {apiResponse: false, error: false};
 //   response.apiResponse = {response: "Quizzards"}
   try {
        const chat_completion = await openAIClient.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content }],
        });
        
        if(Array.isArray(chat_completion.data.choices) && chat_completion.data.choices.length){
            let choice = chat_completion.data.choices[0];
            let message =  choice.message;
            if(message.content){
                response.apiResponse = JSON.parse(message.content);
            }
        }
        
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
        response.error = JSON.stringify(error,null, 4);
    }  
    return response;
}


export const getExistingUsers = async (firestoreClient, emails) => {
    let response = {apiResponse: false, error: false};
    try{
        let usersRef = firestoreClient.collection("users").where('email', 'in', emails);
        let querySnapshot = await usersRef.get();
        response.apiResponse = querySnapshot.docs.map(doc=>doc.data());
    } catch(err){
        console.error(err);
        response.error = err;
    }
    
    return response;
}

export const addDataToDynamoDB = async (data) => {
    let response = {apiResponse: false, error: false};
    try{
        const newTeam = new Team(data);
        await newTeam.save();
        response.apiResponse = newTeam;
    }catch(e){
        console.error(e);
        response.error = e;
    }
    return response;
    
}

export const getTeamNamesFromDynamoDB = async () =>{
    let response = {apiResponse: false, error: false};
    try{
        const allRecords = await Team.scan({},{projection: ['team_name']}).exec();
        console.log({event: "checking allRecords",allRecords});
        let teamNames = allRecords.toJSON();
        if(teamNames.length){
            teamNames = teamNames.map(item=>item.team_name);
        }
        response.apiResponse = teamNames;
    }catch(e){
        console.error(e);
        response.error = e;
    }
    return response;
}
