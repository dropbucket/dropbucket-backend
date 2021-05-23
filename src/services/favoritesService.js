import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

export const showFavorites2 = async (req) => {
  console.log('connect');
  try {
    AWS.config.update({
      region: process.env.AWS_REGION,
      endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
      accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
      secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
      //sessionToken: process.env.DYNAMODB_SESSION_TOKEN,
    });

    let docClient = new AWS.DynamoDB.DocumentClient();
    let params = {
      TableName: 'FileDirTable',
      FilterExpression: 'is_starred = :tr and file_owner = :fo',
      ExpressionAttributeValues: {
        ':tr': true,
        ':fo': req.file_owner,
      },
    };

    const data = await docClient.scan(params).promise();
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

export const switchFavorites2 = async (req) => {
  console.log('connect');
  try {
    AWS.config.update({
      region: process.env.AWS_REGION,
      endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
      accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
      secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
      //sessionToken: process.env.DYNAMODB_SESSION_TOKEN,
    });

    let docClient = new AWS.DynamoDB.DocumentClient();
    let params = {
      TableName: 'FileDirTable',
      Key: {
        parent_id: req.parent_id,
        id: req.id,
      },
    };

    let data = await docClient.get(params).promise();
    let is_starred = data.Item.is_starred;
    params = {
      TableName: 'FileDirTable',
      Key: {
        parent_id: req.parent_id,
        id: req.id,
      },
      UpdateExpression: 'set is_starred = :n',
      ExpressionAttributeValues: {
        ':n': !is_starred,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    data = await docClient.update(params).promise();
    console.log(JSON.stringify(data, null, 2));
    const resMessage = {
      statusCode: 200,
      success: true,
      is_starred: data.Attributes.is_starred,
      msg: '즐겨찾기 설정/해제 완료',
    };

    return resMessage;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};