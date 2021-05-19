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
      FilterExpression: 'is_starred = :tr',
      ExpressionAttributeValues: {
        ':tr': true,
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
      UpdateExpression: 'set is_starred = :n',
      ExpressionAttributeValues: {
        ':n': !req.is_starred,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    await docClient
      .get(params)
      .promise()
      .then((data) => {
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
        data = docClient
          .update(params)
          .promise()
          .then((data) => {
            console.log(JSON.stringify(data, null, 2));
            return data;
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};
