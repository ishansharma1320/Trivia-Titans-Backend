import {getTeamsFromDynamoDB, getExistingUsers} from "./functions.mjs";
import admin from 'firebase-admin';
import {readFileSync} from "fs";
import { getFirestore } from "firebase-admin/firestore";

let dependencies = {firestore: undefined};

let isInitialized = false;

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
    
  }
}

initializeExternalDependencies().catch((err)=>{
  console.error(err);
})


export const handler = async (event) => {
  // TODO implement
  const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, AuthorizationToken",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", 
};
  let decodedToken = null;
  if(event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.decodedToken){
    decodedToken = JSON.parse(event.requestContext.authorizer.decodedToken).decodedToken;
  }
  
  let teamData = [];
  
  if(decodedToken){
    let user_id = decodedToken.user_id;
    let teamResponse = await getTeamsFromDynamoDB(user_id);
    if(!teamResponse.error){
      for(let item of teamResponse.apiResponse){
      if(Array.isArray(item.members) && item.members.length){
        let uids = item.members.map(member=>member.uid);
        console.log({uids})
        let usersData = await getExistingUsers(dependencies.firestore,uids);
        if(!usersData.error){
          item.members = item.members.map((member)=>{
            let userData = usersData.apiResponse.find(el=>el.uid === member.uid);
            let newMembers = member;
            if(userData){
              newMembers = {...member, ...userData};
            }
            return newMembers;
          })
        } else {
          console.error(usersData.error);
        }
  
      }
      teamData.push(item);
    }  
      
    } else {
      console.error(teamResponse.error)
    }
    
    
  }
  
  const response = {
    statusCode: 200,
    body: JSON.stringify({status: true, teamData}),
    headers: headers
  };
  return response;
};
