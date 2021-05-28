var AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/config/awsconfig.json');

findItem = async (request) => {
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
        parent_id: 'mom',
        id: 'dad',
      },
    };

    docClient.get(
      params,
      await function (err, data) {
        console.log(JSON.stringify(data, null, 2));
      },
    );
    return data[0];
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

findItem();
