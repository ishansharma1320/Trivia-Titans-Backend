import {Team} from "./TeamsModel.mjs";

export const handler = async (event) => {
  // TODO implement
  let statusCode = 200;
  console.log({event: "Got Event Parameters", data: JSON.stringify(event.queryStringParameters)})
  let requiredKeys = ["uid","team","action"];
  let response = {status: true}
  try{
    if(event.queryStringParameters){
    let action = event.queryStringParameters.action;
    
    if(action === "accept"){
      console.log({event: "In accept", data: event.queryStringParameters});
      let teamData = await Team.get({team_id: event.queryStringParameters.team});
      if(Array.isArray(teamData.members) && teamData.members.length){
        console.log(teamData);
        teamData.members = teamData.members.map(item=>{
          if(item.uid === event.queryStringParameters.uid){
            item.inviteStatus = "accepted";
          }
          return item;
        })
        console.log({event: "Updated Team Member Invite Status", data: teamData})
        await teamData.save();
      }
    } else {
      let teamData = await Team.get({team_id: event.queryStringParameters.team});
      if(Array.isArray(teamData.members) && teamData.members.length){
        let member = teamData.members.find(item=>item.uid === event.queryStringParameters.uid);
        if(member.inviteStatus !== 'accepted'){
          teamData.members = teamData.members.filter(item=>item.uid !== event.queryStringParameters.uid);
          console.log({event: "Updated Team Member Invite Status", data: teamData})
          await teamData.save();  
        } else {
          console.log({event: "Member has already accepted team invite", data: member})
          response.response = {message: "Member has already accepted team invite"}
        }
        
      }
    }
  }
  }
  catch(e){
    console.error(e);
    response["error"] = e;
    response.status = false;
    statusCode = 500;
  }
  
  const lambdaResponse = {
    statusCode: statusCode,
    body: JSON.stringify(response),
  };
  return lambdaResponse;
};
