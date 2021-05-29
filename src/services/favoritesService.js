import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { me } from '../utils/decode.js';
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

    const im = await me(req);
    if (im.statusCode === 401 || im.statusCode === 500) {
      return im;
    }
    const file_owner = im.userId;

    let docClient = new AWS.DynamoDB.DocumentClient();
    let params = {
      TableName: 'FileDirTable',
      FilterExpression: 'is_starred = :tr and file_owner = :fo',
      ExpressionAttributeValues: {
        ':tr': true,
        ':fo': file_owner,
      },
    };

    const data = await docClient.scan(params).promise();
    console.log(JSON.stringify(data, null, 2));

    const resMessage = {
      statusCode: 200,
      success: true,
      data: data,
      msg: '즐겨찾기 조회 완료',
    };

    return resMessage;
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

    const im = await me(req);
    if (im.statusCode === 401 || im.statusCode === 500) {
      return im;
    }
    const file_owner = im.userId;

    let docClient = new AWS.DynamoDB.DocumentClient();
    let params = {
      TableName: 'FileDirTable',
      Key: {
        file_owner: file_owner,
        id: req.body.id,
      },
    };

    let data = await docClient.get(params).promise();

    //console.log(JSON.stringify(data, null, 2));
    let is_starred = data.Item.is_starred;
    params = {
      TableName: 'FileDirTable',
      Key: {
        file_owner: file_owner,
        id: req.body.id,
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
      msg: '즐겨찾기 설정/해제 완료',
    };

    return resMessage;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};
