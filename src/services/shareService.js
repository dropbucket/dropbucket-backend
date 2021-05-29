import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { me } from '../utils/decode.js';
dotenv.config();

export const shareItem2 = async (req) => {
  console.log('connect');
  try {
    AWS.config.update({
      region: process.env.AWS_REGION,
      //   endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
      accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
      secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
      //sessionToken: process.env.DYNAMODB_SESSION_TOKEN,
    });
    let docClient = new AWS.DynamoDB.DocumentClient();
    let params = {
      TableName: 'FileDirTable',
      FilterExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': req.body.id,
      },
    };

    let fileArr = await docClient.scan(params).promise();

    if (fileArr.Count === 0) {
      return {
        statusCode: 400,
        success: false,
        msg: '해당하는 id의 파일이 존재하지않습니다.',
      };
    }
    const im = await me(req);
    let file = fileArr.Items[0];

    if (file.file_owner !== im.userId) {
      return {
        statusCode: 400,
        success: false,
        msg: '권한이 없습니다',
      };
    }
    params = {
      TableName: 'FileDirTable',
      Key: {
        file_owner: file.file_owner,
        id: req.body.id,
      },
      UpdateExpression: 'set is_shared = :n',
      ExpressionAttributeValues: {
        ':n': true,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    let status = await docClient.update(params).promise();
    console.log(file);

    let s3 = new AWS.S3();

    // key값 수정 필요 ! s3에 파일이 어떻게 저장 돼있는지에 따라 수정
    const BUCKET_NAME = 'dropbucket123';
    params = {
      Bucket: BUCKET_NAME,
      Key: file.id,
      //Key: file.id + '.' + file.content_type,
    };

    let url = await s3.getSignedUrlPromise('getObject', params);

    const resMessage = {
      statusCode: 200,
      success: true,
      msg: '파일공유 url생성 완료',
      url: url,
    };

    return resMessage;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};
