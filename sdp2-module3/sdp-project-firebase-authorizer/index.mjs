import admin from 'firebase-admin';
import { readFileSync } from "fs";


let isInitialized = false;



const initializeFirebase = async () => {
  if (!isInitialized) {
    isInitialized = true; 
    let serviceAccountJson = JSON.parse(readFileSync('./service_account.json', 'utf8'));
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
    }
  }
  
  
}

const verifyIdToken = async (idToken) =>{
    console.log({event: "Inside verifyIDToken", data: idToken, admin})
    const decodedToken = await admin.auth().verifyIdToken(idToken); 
    return decodedToken;
}




export const handler = async (event) => {
  
  console.log({event: "Received Lambda event",data: event})
  await initializeFirebase();
  
  let auth = "Deny"
  let uid = null;
  let decodedTokenData = null;
  if(event.authorizationToken){
    console.log(event.authorizationToken);
    decodedTokenData = await verifyIdToken(event.authorizationToken)
    auth = "Allow"
    uid = decodedTokenData.uid;
  }
  console.log({event: "Decoded Token", decodedTokenData});
  let authResponse = { "principalId": "USER_NOT_ALLOWED", "policyDocument": { "Version": "2012-10-17", "Statement": [{"Action": "execute-api:Invoke", "Resource": [], "Effect": auth}] }}
  if(uid !== null){
    let app = "app";
    
    if(decodedTokenData.admin){
      app = "admin"
    }
    let accessURL = `arn:aws:execute-api:us-east-1:705568486172:6418qzn2i7/dev/*/${app}/*`;
    authResponse.policyDocument.Statement[0].Resource = [accessURL];
    authResponse["principalId"] = uid;
    authResponse["context"] = {"decodedToken": JSON.stringify({decodedToken: decodedTokenData})}
  }
  
  console.log({event: "Created Inline Auth Response",data: JSON.stringify(authResponse)})
  
  return authResponse;
};







