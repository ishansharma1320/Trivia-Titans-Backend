import {Team} from "./TeamsModel.mjs";

export const getTeamFromDynamoDB = async (team_id) =>{
    let response = {apiResponse: false, error: false};
    try{
        const teamData = await Team.query("team_id").eq(team_id).exec();
        
        response.apiResponse = teamData;
        
    }catch(e){
        console.error(e);
        response.error = e;
    }
    return response;
}
