var AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/../../config/awsconfig.json');

exports.findItem = async (request) => {
  console.log('connect');
  try {
    AWS.config.update({
      // endpoint가 s3 일수도 있고, dynamodb일 수도 있으므로
      // endpoint만 따로 설정해준다. 나머지는 config에서
      endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
    });

    let docClient = new AWS.DynamoDB.DocumentClient();
    let params = {
      TableName: 'FileDirTable',
      Key: {
        parent_id: request.parent_id,
        id: request.id,
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

exports.updateItem = async (request) => {
  console.log('connect');
  try {
    AWS.config.update({
      // endpoint가 s3 일수도 있고, dynamodb일 수도 있으므로
      // endpoint만 따로 설정해준다. 나머지는 config에서
      endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
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
