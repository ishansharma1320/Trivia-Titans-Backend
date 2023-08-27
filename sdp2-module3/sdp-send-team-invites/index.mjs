import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SQSClient, DeleteMessageBatchCommand, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import {publishMessageToSNS, deleteMessagesFromQueue, getExistingUsers} from "./functions.mjs";
import {v4 as uuidv4} from "uuid";
import admin from 'firebase-admin';
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from 'fs';

let dependencies = {firestore: undefined, snsClient: undefined, sqsClient: undefined};

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
    let awsConfig = {region: "us-east-1"};
    dependencies.sqsClient = new SQSClient(awsConfig);
    dependencies.snsClient = new SNSClient(awsConfig)
  }
}

initializeExternalDependencies().catch((err)=>{
  console.error(err);
})


export const handler = async (event) => {
  const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", 
};
  /*
  TODO implement
  {
    "admin": "<email>",
    "members": ["<email>","<email>","<email>"]
  }
  */
  let statusCode = 200;
  let response = {status: true, response: null};
  try{
    if(event.Records && Array.isArray(event.Records) && event.Records.length){
    let deletionMessages = [];
    for(let item of event.Records){
      let body = JSON.parse(item.body);
      console.log({event: "Data Received from Queue", body});
      let sentResponse = await publishMessageToSNS(dependencies.snsClient, body);
      response.response = sentResponse;
      deletionMessages.push({Id: item.messageId, ReceiptHandle: item.receiptHandle});
    } 
    
    let deletionResponse = await deleteMessagesFromQueue(dependencies.sqsClient, deletionMessages);
  } else if(event.body){
    let requestBody = JSON.parse(event.body);
    if(Array.isArray(requestBody.members) && requestBody.members.length){
      let existingUsersResponse = await getExistingUsers(dependencies.firestore, requestBody.members)  
      if(typeof existingUsersResponse.apiResponse !== 'boolean' && Array.isArray(existingUsersResponse.apiResponse)){
        console.log({event: "Sending invites when invoked via API Gateway", response: JSON.stringify(existingUsersResponse,null,4)});
        response.response = [];
        for(let item of existingUsersResponse.apiResponse){
          let message = {team_id: requestBody.team_id, admin: requestBody.admin, uid: item.uid};
          let sentResponse = await publishMessageToSNS(dependencies.snsClient, message);
          response.response.push(sentResponse);
          console.log({event: "Sending Msg to SNS", data: sentResponse})
        }
      
    }
    
    } 
    
  }
  } catch(e){
    response.status = false;
    response.error = e;
    console.error(e);
    statusCode = 500;
  }
  console.log({event: "Sending Back Response", data: response})
  return {statusCode: statusCode, body: JSON.stringify(response), headers};
};
