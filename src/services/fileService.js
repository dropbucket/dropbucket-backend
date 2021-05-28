import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import uuid from 'uuid';
import fs from 'fs';
import jwt from 'express-jwt';
dotenv.config();

// AWS Config
const awsConfig = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
  secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
  sessionToken: process.env.DYNAMODB_SESSION_TOKEN,
};

export const uploadS3 = async () => {
  AWS.config.update(awsConfig);
  const s3 = new AWS.S3({ endpoint: 'https://s3.us-east-1.amazonaws.com' });

  const uuidID = uuid.v1().toString();
  console.log(uuidID);
  global.uuidID = uuidID;

  return multer({
    storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: 'dropbucket-file',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      contentDisposition(req, file, cb) {
        cb(null, `inline; filename=${file.originalname}`); // inline
      },
      key(req, file, cb) {
        cb(null, global.uuidID); // s3에 저장될 때의 파일 이름
      },
    }),
  });
};

export const uploadFile2 = async (req) => {
  try {
    console.log(req.file);
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient({
      endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
    });

    // 같은 parent_id을 가진 파일들 조회
    const fileArrOfSameDir = await docClient
      .query({
        TableName: 'FileDirTable',
        KeyConditionExpression: '#parent_id = :parent_id',
        ExpressionAttributeNames: {
          '#parent_id': 'parent_id',
        },
        ExpressionAttributeValues: {
          ':parent_id': req.body.parent_id,
        },
      })
      .promise();
    // console.log(JSON.stringify(fileArrOfSameDir, null, 2));

    let fileName = req.file.originalname.split('.'); // 'test.png' -> ['test', 'png']

    // 폴더 내에 같은 filename이 존재하면 이름 변경 e.g. 'test.png' -> 'test-(1).png' -> 'test-(2).png'
    fileArrOfSameDir.Items.forEach((item) => {
      if (item.filename.split('.')[0] == fileName[0]) {
        fileName[0].indexOf('-(') != -1
          ? (fileName[0] = `${fileName[0].slice(
              0,
              fileName[0].indexOf('-(') + 2,
            )}${+fileName[0][fileName[0].indexOf('-(') + 2] + 1}${')'}`)
          : (fileName[0] = `${fileName[0]}-(1)`);
      }
    });

    // DynamoDB table에 item 추가
    const data = await docClient
      .put({
        TableName: 'FileDirTable',
        Item: {
          id: global.uuidID,
          parent_id: req.body.parent_id,
          file_owner: req.body.file_owner,
          filename: fileName.join('.'),
          description: null,
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
          directory: 'arn:aws:s3:::dropbucket-file',
          shared_url: null,
        },
      })
      .promise();

    // console.log(JSON.stringify(data, null, 2));

    return {
      statusCode: 200,
      success: true,
      msg: '파일 생성 완료',
    };
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

export const downloadFile2 = async (req) => {
  try {
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient({
      endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
    });
    const s3 = new AWS.S3({ endpoint: 'https://s3.us-east-1.amazonaws.com' });

    s3.getObject(
      {
        Bucket: 'dropbucket-file',
        Key: req.id,
      },
      (err, data) => {
        if (err) {
          // an error occurred
          console.log(err, err.stack);
        } else {
          // successful response
          // 로컬상에 다운로드 받길 원하면 주석 풀고 폴더 및 파일 하나를 아무대나 생성하고 절대값 주소를 아래에 넣으면 된다.
          // fs.writeFileSync('/Users/dykoon/workspace/dropbucket-backend/download/test.png', data.Body);  // 절대값 주소
          console.log(data);
        }
      },
    );

    // db에서 id를 가진 filename을 찾아서 변경 추가 예정
    // 현재는 로컬상에 저장한다. 추후에 front단으로 전달 예정

    return {
      statusCode: 200,
      success: true,
      msg: '파일 다운로드 완료',
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 503,
      success: false,
      msg: '파일 다운로드 실패',
    };
  }
};

export const findFile2 = async (req) => {
  try {
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient({
      endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
    });

    // 같은 parent_id을 가진 파일들 조회
    const fileArrOfSameDir = await docClient
      .query({
        TableName: 'FileDirTable',
        KeyConditionExpression: '#parent_id = :parent_id',
        ExpressionAttributeNames: {
          '#parent_id': 'parent_id',
        },
        ExpressionAttributeValues: {
          ':parent_id': req.parent_id,
        },
      })
      .promise();

    // const data = await docClient.get(params).promise();
    console.log(JSON.stringify(fileArrOfSameDir, null, 2));
    return {
      statusCode: 200,
      success: true,
      msg: '파일 조회 성공',
      data: fileArrOfSameDir,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 503,
      success: false,
      msg: '파일 조회 실패',
    };
  }
};

export const updateFile2 = async (req) => {
  try {
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient({
      endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
    });

    // 변경
    const data = await docClient
      .update({
        TableName: 'FileDirTable',
        Key: {
          parent_id: req.parent_id,
          id: req.id,
        },
        // 어떤 것을 변경할지 고르고 그것의 이름을 지정해준다.
        // 이때 속성명이 dynamodb의 예약어와 동일하면 충돌이 발생해 오류가 발생할 수 있다.
        UpdateExpression: 'set me = :me',

        // 위에서 고른것을 변경한다. 이때 지정해준 이름을 사용해야 한다.
        ExpressionAttributeValues: {
          ':me': req.me,
        },
        ReturnValues: 'UPDATED_NEW',
      })
      .promise();

    console.log(JSON.stringify(data, null, 2));

    return {
      statusCode: 200,
      success: true,
      msg: '파일정보 변경 성공',
      data: data,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 503,
      success: false,
      msg: '파일정보 변경 실패',
    };
  }
};

// delete 관련은 스케쥴러에 의해 발생하므로 여기선 제외

// const deleteToS3 = async (data) => {
//   const s3 = new AWS.S3({ endpoint: "https://s3.us-east-1.amazonaws.com" });

//   // 단일 Object 삭제
//   s3.deleteObject({
//     Bucket: 'dropbucket-file',
//     Key: data
//   }, (err, data) => {
//     if (err) console.log(err);
//     else console.log('s3 deleteObject ', data)
//   });

//   // 여러 파일 삭제용
//   // const params = {
//   //   Bucket: "examplebucket",
//   //   Delete: {
//   //    Objects: [
//   //       {
//   //      Key: "HappyFace.jpg",
//   //      VersionId: "2LWg7lQLnY41.maGB5Z6SWW.dcq0vx7b"
//   //     },
//   //       {
//   //      Key: "HappyFace.jpg",
//   //      VersionId: "yoz3HB.ZhCS_tKVEmIOr7qYyyAaZSKVd"
//   //     }
//   //    ],
//   //    Quiet: false
//   //   }
//   //  };
// };

// // file이 db에 없어도 오류 발생 안함
// export const deleteFile2 = async (req) => {
//   try {
//     AWS.config.update(awsConfig);
//     const docClient = new AWS.DynamoDB.DocumentClient({ endpoint: "https://dynamodb.us-east-1.amazonaws.com" });

//     const params = {
//       TableName: 'FileDirTable',
//       Key: {
//         parent_id: req.parent_id,
//         id: req.id,
//       },
//     };

//     const data = await docClient.delete(params).promise();
//     console.log(JSON.stringify(data, null, 2));

//     const resMessage = {
//       'statusCode': 200,
//       'success': true,
//       'msg': '파일 삭제 완료'
//     }

//     deleteToS3('test.png');

//     return resMessage;

//   } catch (err) {
//     const resMessage = {
//       'statusCode': 503,
//       'success': false,
//       'msg': '파일 삭제 실패'
//     }
//     return resMessage;
//   }
// };

// 김태영 file 삭제, 휴지통 조회, 복원

export const getTrash2 = async (req) => {
  console.log('connect');

  const file_owner = 'aljenfalkjwefnlakjwef';
  // 현재 시크릿 키가 없어 사용 불가.
  /* const im = await me(req);
if (im.statusCode === 401 || im.statusCode === 500) {
  return im;
}
const file_owner = im.userId;
*/

  try {
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient();

    const parentOwnerParam = {
      TableName: 'FileDirTable',
      Key: {
        file_owner: file_owner,
        id: req.body.id,
      },
    };

    const owner = (await docClient.get(parentOwnerParam).promise()).Item;

    // 루트폴더의 주인인지 확인
    if (file_owner !== owner.file_owner) {
      return {
        statusCode: 400,
        success: false,
        msg: '조회 권한이 없습니다.',
      };
    }

    // 삭제된 폴더를 찾기위해 일단 user가 가지고있는 것들을 가져온다.
    const rootValidParam = {
      TableName: 'FileDirTable',
      KeyConditionExpression: '#file_owner = :file_owner',
      ExpressionAttributeNames: {
        '#file_owner': 'file_owner',
      },
      ExpressionAttributeValues: {
        ':file_owner': file_owner,
      },
    };

    const folders = (await docClient.query(rootValidParam).promise()).Items;

    let data = [];

    for (let i = 0; i < folders.length; i++) {
      if (folders[i].is_deleted === true) {
        data.push(folders[i]);
      }
    }

    console.log(JSON.stringify(data, null, 2));

    const resMessage = {
      statusCode: 200,
      success: true,
      msg: '휴지통 조회 완료',
      data: data,
    };
    return resMessage;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

export const deleteFile2 = async (req) => {
  console.log('connect');
  // 현재 시크릿 키가 없어 사용 불가.
  /* const im = await me(req);
  if (im.statusCode === 401 || im.statusCode === 500) {
    return im;
  }
  const file_owner = im.userId;
  */
  const file_owner = 'aljenfalkjwefnlakjwef';

  try {
    AWS.config.update(awsConfig);
    const docClient = new AWS.DynamoDB.DocumentClient();

    const OwnerParam = {
      TableName: 'FileDirTable',
      Key: {
        file_owner: file_owner,
        id: req.body.id,
      },
    };

    const deleteF = (await docClient.get(OwnerParam).promise()).Item;

    // 폴더이름
    const fileName = deleteF.filename;

    // 파일 주인 확인
    if (file_owner !== deleteF.file_owner) {
      return {
        statusCode: 400,
        success: false,
        msg: '파일을 삭제할 권한이 없습니다.',
      };
    }

    if (deleteF.is_folder === true) {
      return {
        statusCode: 400,
        success: false,
        msg: '파일을 삭제할 권한이 없습니다.',
      };
    }

    if (deleteF.is_deleted) {
      return {
        statusCode: 400,
        success: false,
        msg: '이미 삭제된 파일 입니다.',
      };
    }

    const overlapParam = {
      TableName: 'FileDirTable',
      KeyConditionExpression: '#file_owner = :file_owner',
      ExpressionAttributeNames: {
        '#file_owner': 'file_owner',
      },
      ExpressionAttributeValues: {
        ':file_owner': file_owner,
      },
    };

    const files = (await docClient.query(overlapParam).promise()).Items;

    // 파일명 중복 체크
    for (let i = 0; i < files.length; i++) {
      if (
        fileName === files[i].filename &&
        files[i].is_deleted &&
        files[i].is_folder === false
      ) {
        return {
          statusCode: 400,
          success: false,
          msg: '휴지통에 이미 동일한 파일이 존재합니다.',
        };
      }
    }
    const change = {
      TableName: 'FileDirTable',
      Key: {
        id: req.body.id,
        file_owner: file_owner,
      },
      UpdateExpression:
        'SET #is_deleted = :is_deleted, #deleted_at = :deleted_at',
      ExpressionAttributeNames: {
        '#is_deleted': 'is_deleted',
        '#deleted_at': 'deleted_at',
        //'#size': 'size',
      },
      // 위에서 고른것을 변경한다. 이때 지정해준 이름을 사용해야 한다.
      ExpressionAttributeValues: {
        ':is_deleted': true,
        ':deleted_at': Date.now(),
        //'#size': location_parent_size + moveF.size,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const data = docClient.update(change).promise();

    const resMessage = {
      statusCode: 200,
      success: true,
      msg: '파일 삭제 완료',
    };
    return resMessage;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};
