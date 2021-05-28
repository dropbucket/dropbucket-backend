import dotenv from 'dotenv';
const AWS = require("aws-sdk");
dotenv.config();
const BUCKET_NAME = "dropbucketpractice";
var table = "FileDirTable";
const s3 = new AWS.S3();
var docClient = new AWS.DynamoDB.DocumentClient()

export const ReleaseShare = async (req)=>{
    
}
export const SetShare = async (req) => {
    console.log(req.body);
    const id = req.body.id;
    const parent_id = req.body.parent_id;

    var params = {
        TableName:table,
        Key:{
            "id": id,
            "parent_id": parent_id
        },
        UpdateExpression: "set is_folder = :i"
    };

    let data = await docClient.get(params).promise();
    let is_shared = data.Item.is_shared;

    params = {
        TableName: 'FileDirTable',
        Key: {
          parent_id: req.body.parent_id,
          id: req.body.id,
        },
        UpdateExpression: 'set is_shared = :i',
        ExpressionAttributeValues: {
          ':i': !is_shared,
        },
        ReturnValues: 'UPDATED_NEW',
      };

    console.log("Set share");
    docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
    }); 
}

