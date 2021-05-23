import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import uuid from 'uuid';
dotenv.config();

// AWS Config
const awsConfig = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
  secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
  sessionToken: process.env.DYNAMODB_SESSION_TOKEN
};

export const uuidID = uuid.v1().toString();

export const uploadFile2 = async (req) => {
  try {
    // console.log(req.file);
    // console.log(req.body.file_owner);
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient({ endpoint: "https://dynamodb.us-east-1.amazonaws.com" });
    

    const params = {
      TableName: 'FileDirTable',
      Item: {
        parent_id: "38c9fc40-b573-11eb-8616-e991aa0e1397", // parent_id를 어떻게 알 수 있을까?
        id: uuidID,
        file_owner: req.body.file_owner,
        filename: req.file.originalname,
        description: req.body.description,
        size: req.file.size,
        content_type: req.file.mimetype,
        is_deleted: false,
        is_shared: false,
        is_starred: false,
        is_folder: false,
        created_at: Date.now(),
        deleted_at: null,
        last_modified_at: Date.now(),
        shared_until: null,
        directory: "arn:aws:s3:::dropbucket-file",
        shared_url: null,
      }
    };

    const data = await docClient.put(params).promise();
    console.log(JSON.stringify(data, null, 2));

    const resMessage = {
      'statusCode': 200,
      'success': true,
      'msg': '파일 생성 완료'
    }
    return resMessage;

  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

// export const findItem2 = async (req) => {
//   console.log('connect');
//   try {
//     AWS.config.update(awsConfig);

//     let docClient = new AWS.DynamoDB.DocumentClient();
//     let params = {
//       TableName: 'FileDirTable',
//       Key: {
//         id: req.id,
//         parent_id: req.parent_id
//       },
//     };

//     const data = await docClient.get(params).promise();
//     console.log(JSON.stringify(data, null, 2));
//     return data;

//   } catch (err) {
//     console.log(err);
//     throw Error(err);
//   }
// };

// export const updateItem2 = async (request) => {
//   console.log('connect');
//   try {
//     AWS.config.update(awsConfig);

//     let docClient = new AWS.DynamoDB.DocumentClient();
//     let params = {
//       TableName: 'FileDirTable',
//       Key: {
//         parent_id: request.parent_id,
//         id: request.id,
//       },
//       // 어떤 것을 변경할지 고르고 그것의 이름을 지정해준다.
//       // 이때 속성명이 dynamodb의 예약어와 동일하면 충돌이 발생해 오류가 발생할 수 있다.
//       UpdateExpression: 'set me = :me',

//       // 위에서 고른것을 변경한다. 이때 지정해준 이름을 사용해야 한다.
//       ExpressionAttributeValues: {
//         ':me': request.me,
//       },
//       ReturnValues: 'UPDATED_NEW',
//     };

//     const data = await docClient.update(params).promise();
//     console.log(JSON.stringify(data, null, 2));
//     return data;
//   } catch (err) {
//     console.log(err);
//     throw Error(err);
//   }
// };

const deleteToS3 = async (data) => {
  const s3 = new AWS.S3({ endpoint: "https://s3.us-east-1.amazonaws.com" });

  // 단일 Object 삭제
  s3.deleteObject({
    Bucket: 'dropbucket-file',
    Key: data
  }, (err, data) => {
    if (err) console.log(err);
    else console.log('s3 deleteObject ', data)
  });

  // 여러 파일 삭제용
  // const params = {
  //   Bucket: "examplebucket", 
  //   Delete: {
  //    Objects: [
  //       {
  //      Key: "HappyFace.jpg", 
  //      VersionId: "2LWg7lQLnY41.maGB5Z6SWW.dcq0vx7b"
  //     }, 
  //       {
  //      Key: "HappyFace.jpg", 
  //      VersionId: "yoz3HB.ZhCS_tKVEmIOr7qYyyAaZSKVd"
  //     }
  //    ], 
  //    Quiet: false
  //   }
  //  };
};

// file이 db에 없어도 오류 발생 안함
export const deleteFile2 = async (req) => {
  try {
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient({ endpoint: "https://dynamodb.us-east-1.amazonaws.com" });

    const params = {
      TableName: 'FileDirTable',
      Key: {
        parent_id: req.parent_id,
        id: req.id,
      },
    };

    const data = await docClient.delete(params).promise();
    console.log(JSON.stringify(data, null, 2));

    const resMessage = {
      'statusCode': 200,
      'success': true,
      'msg': '파일 삭제 완료'
    }

    deleteToS3('test.png');

    return resMessage;

  } catch (err) {
    const resMessage = {
      'statusCode': 503,
      'success': false,
      'msg': '파일 삭제 실패'
    }
    return resMessage;
  }
};