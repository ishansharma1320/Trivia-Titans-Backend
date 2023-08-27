import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import admin from 'firebase-admin';
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from 'fs';

import { SQSClient } from "@aws-sdk/client-sqs";
import {getExistingUsers, createTeamName, getTeamNamesFromDynamoDB, addDataToDynamoDB, pushMessagesToQueue} from "./functions.mjs";
import {v4 as uuidv4} from "uuid";


dotenv.config()


let dependencies = {firestore: undefined, sqsClient: undefined, openAIClient: undefined};

let isInitialized = false;


/*
const openai = new OpenAIApi(configuration);

create a team name using chatgpt
get uids for emails, if emails are registered, add them to the team
user who creates the team is the admin
message is pushed to SQS queue
SQS queue triggers a lambda which sends the message to SNS

{
  team_name: "<>",
  team_id: "<>",
  members: [{"uid": "<>", "isAdmin": boolean, "inviteStatus": "accepted | sent"}]
  stats: {
    gamesPlayed: "<count>",
    gamesWon: "<count>",
    points: "<count>"
  }
}

*/

const initializeExternalDependencies = async () => {
  if (!isInitialized) {
    isInitialized = true; 

    
    if (!admin.apps.length) {
      const serviceAccountJson = JSON.parse(readFileSync('./service_account.json', 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
       
    }
    
    dependencies.firestore = getFirestore();
    let configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    });
    dependencies.openAIClient = new OpenAIApi(configuration);
    let awsConfig = {region: "us-east-1"};
    dependencies.sqsClient = new SQSClient(awsConfig);
  }
}

initializeExternalDependencies().catch((err)=>{
  console.error(err);
})


export const handler = async (event) => {
  
  const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept,AuthorizationToken",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", 
};
  /*
  TODO implement
  {
    "admin": "<email>",
    "members": ["<email>","<email>","<email>"]
  }
  */
  
  let dataToInsert = {};
  let adminEmail;
  if(event.body){
    let requestBody = JSON.parse(event.body);
    let members = requestBody.members;
    adminEmail = requestBody.admin;
    let emailQuery = [];
    if(adminEmail){
            emailQuery.push(adminEmail)
    }
    
    if(Array.isArray(members) && members.length){
      emailQuery = [...emailQuery, ...members];
    }
    
    let existingUsersResponse = await getExistingUsers(dependencies.firestore, emailQuery);
    console.log({event: "Queried Firebase Database", response: JSON.stringify(existingUsersResponse,null,4)})
    
    let existingTeamNamesResponse = await getTeamNamesFromDynamoDB();
    console.log({event: "Queried DynamoDB Database for TeamNames", response: JSON.stringify(existingTeamNamesResponse,null,4)})
    
    
    let teamNameResponse = await createTeamName(dependencies.openAIClient, existingTeamNamesResponse.apiResponse);  
      console.log({event: "Created Team Name using ChatGPT API", response: JSON.stringify(teamNameResponse,null,4)})
      
      dataToInsert["team_id"] = uuidv4();
      dataToInsert["team_name"] = typeof teamNameResponse.apiResponse !== 'boolean' && teamNameResponse.apiResponse.response ? teamNameResponse.apiResponse.response : undefined;
      dataToInsert["members"] = [];
      
      if(typeof existingUsersResponse.apiResponse !== 'boolean' && Array.isArray(existingUsersResponse.apiResponse)){
        console.log({event: "Creating Data Model", response: JSON.stringify(existingUsersResponse,null,4)});
        
        dataToInsert["members"] = existingUsersResponse.apiResponse.map(user=>{
          let item = {uid: user.uid};
          if(user.email === adminEmail){
            item.isAdmin = true;
            item.inviteStatus = "accepted";
          } else {
            item.isAdmin = false;
            item.inviteStatus = 'sent';
          }
          
          return item;
        })
        
        }
        
        console.log({event: "Created Data Model", response: JSON.stringify(dataToInsert,null,4)})
  }
  
  
  
  if(Object.keys(dataToInsert).length){
          
          let addDataResponse = await addDataToDynamoDB(dataToInsert);
          console.log({event: "Added Data to DynamoDB", response: JSON.stringify(dataToInsert,null,4)});
          if(dataToInsert.members.length){
            console.log({event: "Building the Queue Input", data: JSON.stringify(dataToInsert.members,null,4)});
            
            let messages = [];
            for(let item of dataToInsert.members){
                if(item.inviteStatus === 'sent'){
                    let message = {team_id: dataToInsert["team_id"], uid: item.uid, admin: adminEmail, team_name: dataToInsert["team_name"]};
                    let newItem = {Id: uuidv4(), MessageBody: JSON.stringify(message)}
                    messages.push(newItem);
                  }    
            }
          
          
          let queueInput = {Entries: messages, QueueUrl: "https://sqs.us-east-1.amazonaws.com/705568486172/part-3-send-invite-buffer"}
          console.log({event: "Sending to Queue", data: JSON.stringify(queueInput,null,4)});
          let pushToQueueResponse = await pushMessagesToQueue(dependencies.sqsClient, queueInput);
      
          console.log({event: "Sent to Queue", data: JSON.stringify(pushToQueueResponse)});  
            
          }
          
  }
  
  
  const response = {
    statusCode: 200,
    body: JSON.stringify(dataToInsert,null,4),
    headers: headers
  };
  return response;
};
