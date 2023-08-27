import admin from 'firebase-admin';
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from 'fs';
import { SNSClient, SubscribeCommand, SetSubscriptionAttributesCommand } from "@aws-sdk/client-sns"; 

let isInitialized = false;
let db;

let snsClient;

const initializeExternalDependencies = async () => {
  if (!isInitialized) {
    isInitialized = true; 

    
    if (!admin.apps.length) {
      const serviceAccountJson = JSON.parse(readFileSync('./service_account.json', 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
       
    }
    
    db = getFirestore();
    snsClient  = new SNSClient({region: "us-east-1"});
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
  let statusCode = 201;
  let response = {status: false, response: null};
  console.log({event: "Received Lambda event",...event})
  
  try{
    let snapshot = [];

  if(event.body){
    let request = JSON.parse(event.body);
    let usersRef = db.collection("users");
    console.log({event: "Inside Event Field Check Condition", ...event})
    snapshot = await usersRef.where("email", "==", request.email).limit(1).get();
    
  }
  
  if(snapshot.docs && snapshot.docs.length){
    let request = JSON.parse(event.body);
    console.log({event: "Queried Firebase", data: snapshot.docs[0].data()})
    let data = snapshot.docs[0].data();
    let subscriptionResponse = await subscribeToSNSTopic(request.email, snsClient);
    let setSubscriptionFilterResponse = await setSubscriptionFilterPolicy(subscriptionResponse, snsClient,data.uid);
    console.log({event: "Set Filter Policy", data: setSubscriptionFilterResponse});
    response.response = {message: subscriptionResponse};
    
    
  } else {
    statusCode = 200;
    response.response = {message: "No user found"};
  } 
  response.status = true;
  } catch (err){
     statusCode = 500;
     console.error(err);
  }
  
  let apiResponse = {
  "statusCode": statusCode ,
    headers: headers,
  "body": JSON.stringify(response)
  };
  console.log({event: "Sending Response", apiResponse})
  
  return apiResponse;
};


const subscribeToSNSTopic = async (email, client) =>{
  const input = { 
  TopicArn: "arn:aws:sns:us-east-1:705568486172:SDP-project-module-3-email-invite-topic",
  Protocol: "email", 
  Endpoint: email,
  ReturnSubscriptionArn: true,
};
const command = new SubscribeCommand(input);
const response = await client.send(command);
return response;
}

const setSubscriptionFilterPolicy = async (subscriptionResponse,client,uid) =>{
    const setSubscriptionAttributesCommand = new SetSubscriptionAttributesCommand({
      SubscriptionArn: subscriptionResponse.SubscriptionArn,
      AttributeName: "FilterPolicy", 
      AttributeValue: JSON.stringify({ "uid": [uid] }), 
    });

    await client.send(setSubscriptionAttributesCommand);
}






