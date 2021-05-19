import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

export const findItem2 = async (req) => {
  console.log('connect');
  try {
    AWS.config.update({
      region: process.env.AWS_REGION,
      endpoint: "https://dynamodb.us-east-1.amazonaws.com",
      accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
      secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
      sessionToken: process.env.DYNAMODB_SESSION_TOKEN
    });

    let docClient = new AWS.DynamoDB.DocumentClient();
    let params = {
      TableName: 'FileDirTable',
      Key: {
        id: req.id,
        parent_id: req.parent_id
      },
    };

    const data = await docClient.get(params).promise();
    console.log(JSON.stringify(data, null, 2));
    return data;

  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

export const updateItem2 = async (request) => {
  console.log('connect');
  try {
    AWS.config.update({
      region: process.env.AWS_REGION, // 각자 사용하는 region
      endpoint: "https://dynamodb.us-east-1.amazonaws.com",
      accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
      secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
      sessionToken: process.env.DYNAMODB_SESSION_TOKEN
    });

    let docClient = new AWS.DynamoDB.DocumentClient();
    let params = {
      TableName: 'FileDirTable',
      Key: {
        parent_id: request.parent_id,
        id: request.id,
      },
      // 어떤 것을 변경할지 고르고 그것의 이름을 지정해준다.
      // 이때 속성명이 dynamodb의 예약어와 동일하면 충돌이 발생해 오류가 발생할 수 있다.
      UpdateExpression: 'set me = :me',

      // 위에서 고른것을 변경한다. 이때 지정해준 이름을 사용해야 한다.
      ExpressionAttributeValues: {
        ':me': request.me,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const data = await docClient.update(params).promise();
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};