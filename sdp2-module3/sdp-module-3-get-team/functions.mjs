import {Team} from "./TeamsModel.mjs";

export const getTeamsFromDynamoDB = async (uid) =>{
    let response = {apiResponse: false, error: false};
    try{
        const allRecords = await Team.scan().exec();
        const teams = allRecords;
        response.apiResponse = [];
        teams.forEach(team=>{
            let exists = false;
            if(Array.isArray(team.members) && team.members.length > 0){
                team.members.map(item=>{
                    if(item.uid === uid){
                        exists = true;
                    }
                })
                
            }
            if(exists){
                let teamObject = team.toJSON()
                response.apiResponse.push(teamObject);
            }
        });
    }catch(e){
        console.error(e);
        response.error = e;
    }
    return response;
}

export const getExistingUsers = async (firestoreClient, uids) => {
    let response = {apiResponse: false, error: false};
    try{
        let usersRef = firestoreClient.collection("users").where('uid', 'in', uids);
        let querySnapshot = await usersRef.get();
        response.apiResponse = querySnapshot.docs.map(doc=>doc.data());
    } catch(err){
        console.error(err);
        response.error = err;
    }
    
    return response;
}