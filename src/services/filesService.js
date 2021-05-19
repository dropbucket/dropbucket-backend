import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import uuid from 'uuid';
dotenv.config();

// AWS Config
const awsConfig = {
  region: process.env.AWS_REGION,
  endpoint: "https://dynamodb.us-east-1.amazonaws.com",
  accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
  secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
  sessionToken: process.env.DYNAMODB_SESSION_TOKEN
};

export const createFile2 = async () => {
  console.log('connect');
  try {
    AWS.config.update(awsConfig);

    const docClient = new AWS.DynamoDB.DocumentClient();
    
    const input = {
      parent_id: "38c9fc40-b573-11eb-8616-e991aa0e1397",
      id: uuid.v1().toString(),
      file_owner: "test@naver.com",
      filename: "first_file",
      description: "this is first test file",
      size: 2519812,
      content_type: "application/pdf",
      is_deleted: false,
      is_shared: false,
      is_starred: false,
      is_folder: false,
      created_at: Date.now(),
      deleted_at: null,
      last_modified_at: Date.now(),
      shared_until: null,
      directory: "arn:aws:s3:::bucket/home/${aws:username}/",
      shared_url: null,
    };

    const params = {
      TableName: 'FileDirTable',
      Item: input
    };

    const data = docClient.put(params).promise();
    console.log(JSON.stringify(data, null, 2));

    const resMessage = {
      'statusCode': 200,
      'headers': {},
      'body': JSON.stringify(data)
    }
    return resMessage;

  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

export const findItem2 = async (req) => {
  console.log('connect');
  try {
    AWS.config.update(awsConfig);

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
    AWS.config.update(awsConfig);

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