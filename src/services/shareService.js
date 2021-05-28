import AWS from 'aws-sdk';
import dotenv from 'dotenv';
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
      Key: {
        parent_id: req.parent_id,
        id: req.id,
      },
      UpdateExpression: 'set is_shared = :n',
      ExpressionAttributeValues: {
        ':n': true,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    let status = await docClient.update(params).promise();
    console.log(JSON.stringify(status, null, 2));

    params = {
      TableName: 'FileDirTable',
      Key: {
        parent_id: req.parent_id,
        id: req.id,
      },
    };

    let data = await docClient.get(params).promise();
    let s3 = new AWS.S3();
    //console.log(data.Item.filename);

    // key값 수정 필요 ! s3에 파일이 어떻게 저장 돼있는지에 따라 수정
    const BUCKET_NAME = 'dropbucket123';
    params = {
      Bucket: BUCKET_NAME,
      Key: data.Item.filename + '.' + data.Item.content_type,
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