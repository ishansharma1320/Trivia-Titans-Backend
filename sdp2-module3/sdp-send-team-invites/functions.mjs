import { PublishCommand } from "@aws-sdk/client-sns";
import { DeleteMessageBatchCommand } from "@aws-sdk/client-sqs";


export async function publishMessageToSNS(client, message){
 let input = { TopicArn: "arn:aws:sns:us-east-1:705568486172:SDP-project-module-3-email-invite-topic",Message: {team_id: message.team_id, admin: message.admin, accept: `https://6418qzn2i7.execute-api.us-east-1.amazonaws.com/dev/app/team/invite?team=${message.team_id}&uid=${message.uid}&action=accept`, decline: `https://6418qzn2i7.execute-api.us-east-1.amazonaws.com/dev/app/team/invite?team=${message.team_id}&uid=${message.uid}&action=decline`}, MessageAttributes: {uid: {DataType: "String", StringValue: message.uid}}};
 input.Message = JSON.stringify(input.Message);

 const command = new PublishCommand(input);
 let response = await client.send(command);
 return response;
}

export async function deleteMessagesFromQueue(client, messages){
  const input = {
  QueueUrl: "https://sqs.us-east-1.amazonaws.com/705568486172/part-3-send-invite-buffer",
  Entries: messages.map(({MessageId, ReceiptHandle})=>{
    return {Id: MessageId, ReceiptHandle};
  })
};
const command = new DeleteMessageBatchCommand(input);
const response = await client.send(command);
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