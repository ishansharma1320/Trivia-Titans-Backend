import {getTeamFromDynamoDB} from "./functions.mjs";



export const handler = async (event) => {
  // TODO implement
  const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, AythorizationToken",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", 
};
  let decodedToken = null;
  
  console.log(event.requestContext)
  if(event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.decodedToken){
    decodedToken = JSON.parse(event.requestContext.authorizer.decodedToken).decodedToken;
  }
  
  let statusCode = 200;
  let response = {status: true, response: null}
  console.log(JSON.stringify({event: "Decoding Token", decodedToken}))
  if(decodedToken && event.body){
    
    let requestBody = JSON.parse(event.body);
    console.log(JSON.stringify({event: "Decoded Token", decodedToken, requestBody}))
    let uid = decodedToken.user_id
    let teamResponse = await getTeamFromDynamoDB(requestBody.team_id);
    if(!teamResponse.error){
      let teamData = teamResponse.apiResponse[0];
      console.log(JSON.stringify({event: "Queried Team data", teamData: teamData}))
      let memberDetails = teamData.members.find(member=>member.uid === uid);
      console.log(JSON.stringify({event: "Getting member details for team", memberDetails}))
      if(memberDetails && memberDetails.isAdmin){
        if(requestBody.action === "UPDATE"){
          teamData.members = teamData.members.map(item=>{
            if(item.uid === requestBody.uid){
              item.isAdmin = !item.isAdmin;
            }
            return item;
          })
        } else {
          teamData.members = teamData.members.filter(item=>item.uid !== requestBody.uid);
        }
        
        await teamData.save();
      }
      console.log({event: `Updated Team with team_id ${requestBody.team_id}`, team: teamData.toJSON()})
      response.response = {requestBody, teamData: teamData.toJSON()};
    }
    else{
      console.error(teamResponse.error);
      response.status = false;
      statusCode = 500;
    }
 
    
    
  }
  
  const apiResponse = {
    statusCode: statusCode,
    body: JSON.stringify(response),
    headers: headers
  };
  return apiResponse;
};
