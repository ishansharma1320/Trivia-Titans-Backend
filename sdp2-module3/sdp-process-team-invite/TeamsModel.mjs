import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import dynamoose from "dynamoose";

dynamoose.aws.sdk = new DynamoDBClient({region: "us-east-1"});
let tablename = "teams"

const teamObjectSchema = new dynamoose.Schema({
    team_id: String,
    team_name: String,
    members: {
        type: Array,
        schema: [{
            type: Object,
            schema: {
            uid: String,
            isAdmin: Boolean,
            inviteStatus: {
                type: String,
                enum: ["accepted", "sent"],
            }
            }
        }]
        
    },
    stats: {
        type: Object,
        schema: {
            gamesPlayed: Number,
            gamesWon: Number,
            points: Number
        },

    },
});

export const Team = dynamoose.model(tablename, teamObjectSchema);

