import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import uuid from 'uuid';
import jwt from 'express-jwt';
dotenv.config();

const awsConfig = {
  region: process.env.AWS_REGION,
  endpoint: 'https://dynamodb.us-east-1.amazonaws.com',
  accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
  secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY,
  sessionToken: process.env.DYNAMODB_SESSION_TOKEN,
};

const me = async function (req) {
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization.split(' ')[1],
      decoded;
    try {
      decoded = jwt.verify(authorization, secret.secretToken);
    } catch (e) {
      return { statusCode: 401, msg: 'unauthorized' };
    }
    let userId = decoded.user_id;
    // Fetch the user by id
    return { statusCode: 200, userId: userId };
  }
  return { statusCode: 500, mas: 'Header error' };
};

export const updateFolder2 = async (req) => {
  console.log('connect');

  // 현재 시크릿 키가 없어 사용 불가.
  /* const im = await me(req);
  if (im.statusCode === 401 || im.statusCode === 500) {
    return im;
  }
  const file_owner = im.userId;
  */

  const file_owner = 'aljenfalkjwefnlakjwef';
  if (req.body.content_type !== null) {
    return {
      statusCode: 400,
      success: false,
      msg: '경로가 잘못되었습니다. 폴더를 생성하는 곳입니다.',
    };
  }

  if (req.body.parent_id === file_owner) {
    return {
      statusCode: 400,
      success: false,
      msg: '루트폴더는 이름과 설명을 변경할 수 없습니다.',
    };
  }

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

    // 폴더 주인 확인
    if (file_owner !== owner.file_owner) {
      return {
        statusCode: 400,
        success: false,
        msg: '변경 권한이 없습니다.',
      };
    }

    let change;
    if (req.body.change_description === undefined) {
      // 중복이름을 확인하기위해 user가 가지고있는 것들을 가져온다.
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

      // 파일명 중복 체크
      for (let i = 0; i < folders.length; i++) {
        if (
          folders[i].filename === req.body.change_foldername &&
          folders[i].parent_id === req.body.parent_id
        ) {
          return {
            statusCode: 400,
            success: false,
            msg: '폴더 이름이 중복됩니다.',
          };
        }
      }
      change = {
        TableName: 'FileDirTable',
        Key: {
          id: req.body.id,
          file_owner: file_owner,
        },
        UpdateExpression:
          'SET #filename = :filename, #last_modified_at = :last_modified_at',
        ExpressionAttributeNames: {
          '#filename': 'filename',
          '#last_modified_at': 'last_modified_at',
        },
        // 위에서 고른것을 변경한다. 이때 지정해준 이름을 사용해야 한다.
        ExpressionAttributeValues: {
          ':filename': req.body.change_foldername,
          ':last_modified_at': Date.now(),
        },
        ReturnValues: 'UPDATED_NEW',
      };
    } else if (req.body.change_foldername === undefined) {
      change = {
        TableName: 'FileDirTable',
        Key: {
          id: req.body.id,
          file_owner: file_owner,
        },
        UpdateExpression:
          'SET #description = :description, #last_modified_at = :last_modified_at',
        ExpressionAttributeNames: {
          '#description': 'description',
          '#last_modified_at': 'last_modified_at',
        },
        // 위에서 고른것을 변경한다. 이때 지정해준 이름을 사용해야 한다.
        ExpressionAttributeValues: {
          ':description': req.body.change_description,
          ':last_modified_at': Date.now(),
        },
        ReturnValues: 'UPDATED_NEW',
      };
    } else {
      // 중복이름을 확인하기위해 user가 가지고있는 것들을 가져온다.
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

      // 파일명 중복 체크
      for (let i = 0; i < folders.length; i++) {
        if (
          folders[i].filename === req.body.change_foldername &&
          folders[i].parent_id === req.body.parent_id
        ) {
          return {
            statusCode: 400,
            success: false,
            msg: '폴더 이름이 중복됩니다.',
          };
        }
      }
      change = {
        TableName: 'FileDirTable',
        Key: {
          id: req.body.id,
          file_owner: file_owner,
        },
        UpdateExpression:
          'SET #filename = :filename, #description = :description, #last_modified_at = :last_modified_at',
        ExpressionAttributeNames: {
          '#description': 'description',
          '#filename': 'filename',
          '#last_modified_at': 'last_modified_at',
        },
        // 위에서 고른것을 변경한다. 이때 지정해준 이름을 사용해야 한다.
        ExpressionAttributeValues: {
          ':description': req.body.change_description,
          ':filename': req.body.change_foldername,
          ':last_modified_at': Date.now(),
        },
        ReturnValues: 'UPDATED_NEW',
      };
    }

    const data = docClient.update(change).promise();
    console.log(JSON.stringify(data, null, 2));

    const resMessage = {
      statusCode: 200,
      success: true,
      msg: '폴더 수정 완료',
    };
    return resMessage;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

export const moveFolder2 = async (req) => {
  console.log('connect');
  // 현재 시크릿 키가 없어 사용 불가.
  /* const im = await me(req);
  if (im.statusCode === 401 || im.statusCode === 500) {
    return im;
  }
  const file_owner = im.userId;
  */
  const file_owner = 'aljenfalkjwefnlakjwef';
  if (req.body.content_type !== null) {
    return {
      statusCode: 400,
      success: false,
      msg: '경로가 잘못되었습니다. 폴더를 생성하는 곳입니다.',
    };
  }
  if (file_owner === req.body.parent_id) {
    return {
      statusCode: 400,
      success: false,
      msg: '루트폴더의 경로는 변경할 수 없습니다.',
    };
  }

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

    const moveF = (await docClient.get(OwnerParam).promise()).Item;
    // 폴더이름
    const folderName = moveF.filename;

    // 폴더 주인 확인
    if (file_owner !== moveF.file_owner) {
      return {
        statusCode: 400,
        success: false,
        msg: '폴더위치를 변경할 권한이 없습니다.',
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

    const folders = (await docClient.query(overlapParam).promise()).Items;

    // 파일명 중복 체크
    for (let i = 0; i < folders.length; i++) {
      if (
        folderName === folders[i].filename &&
        folders[i].parent_id === req.body.location_id
      ) {
        return {
          statusCode: 400,
          success: false,
          msg: '폴더 이름이 중복됩니다.',
        };
      }
    }
    /*
    let before_parent_size = 0;
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].id === moveF.parent_id) {
        before_parent_size = folders[i].size;
      }
    }

    const beforeParentFolderSizeChange = {
      TableName: 'FileDirTable',
      Key: {
        id: moveF.parent_id,
        file_owner: file_owner,
      },
      UpdateExpression: 'SET #size = :size',
      ExpressionAttributeNames: {
        '#size': 'size',
      },
      // 위에서 고른것을 변경한다. 이때 지정해준 이름을 사용해야 한다.
      ExpressionAttributeValues: {
        ':size': before_parent_size - moveF.size,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const size_change = docClient
      .update(beforeParentFolderSizeChange)
      .promise();

    let location_parent_size = 0;
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].id === req.body.parent_id) {
        location_parent_size = folders[i].size;
      }
    }
  */
    const change = {
      TableName: 'FileDirTable',
      Key: {
        id: req.body.id,
        file_owner: file_owner,
      },
      UpdateExpression: 'SET #parent_id = :location',
      ExpressionAttributeNames: {
        '#parent_id': 'parent_id',
        //'#size': 'size',
      },
      // 위에서 고른것을 변경한다. 이때 지정해준 이름을 사용해야 한다.
      ExpressionAttributeValues: {
        ':location': req.body.location_id,
        //'#size': location_parent_size + moveF.size,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const data = docClient.update(change).promise();

    const resMessage = {
      statusCode: 200,
      success: true,
      msg: '폴더 위치 수정 완료',
      location: req.location_id,
    };
    return resMessage;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

export const createFolder2 = async (req) => {
  console.log('connect');
  // 현재 시크릿 키가 없어 사용 불가.
  /* const im = await me(req);
  if (im.statusCode === 401 || im.statusCode === 500) {
    return im;
  }
  const file_owner = im.userId;
  */
  const file_owner = 'aljenfalkjwefnlakjwef';
  if (req.body.content_type !== null) {
    return {
      statusCode: 400,
      success: false,
      msg: '경로가 잘못되었습니다. 폴더를 생성하는 곳입니다.',
    };
  }
  try {
    AWS.config.update(awsConfig);
    let input = {};
    let id = uuid.v1().toString();
    const docClient = new AWS.DynamoDB.DocumentClient();

    // 루트폴더를 생성하는 경우
    if (req.body.parent_id === 'create root') {
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
      if (folders.length !== 0) {
        return {
          statusCode: 400,
          success: false,
          msg: '이미 루트폴더가 존재합니다.',
        };
      }
      input = {
        parent_id: file_owner,
        id: id,
        file_owner: file_owner,
        filename: 'root',
        description: 'root',
        size: 0,
        content_type: null,
        is_deleted: false,
        is_shared: false,
        is_starred: false,
        is_folder: false,
        created_at: Date.now(),
        deleted_at: null,
        last_modified_at: Date.now(),
        shared_until: null,
        directory: 'folder',
        shared_url: null,
      };
    } else {
      // 루트폴더가 아닌 일반 폴더를 생성하는 경우
      // 해당 parent_id를 갖는 폴더를 가져온다.
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
      console.log(folders);
      let parentFolder = -1;
      for (let i = 0; i < folders.length; i++) {
        if (folders[i].id === req.body.parent_id) {
          parentFolder = i;
          break;
        }
      }

      if (parentFolder === -1) {
        return {
          statusCode: 400,
          success: false,
          msg: '존재하지 않는 폴더에 폴더를 생성할 수 없습니다.',
        };
      }

      // 폴더 주인 확인
      if (folders[parentFolder].file_owner !== file_owner) {
        return {
          statusCode: 400,
          success: false,
          msg: '폴더를 생성할 권한이 없습니다.',
        };
      }

      // 파일명 중복 체크
      for (let i = 0; i < folders.length; i++) {
        if (
          folders[i].filename === req.body.filename &&
          folders[i].parent_id === req.body.parent_id
        )
          return {
            statusCode: 400,
            success: false,
            msg: '폴더 이름이 중복됩니다.',
          };
      }

      // 값을 넣는 부분
      input = {
        parent_id: req.body.parent_id,
        id: id,
        file_owner: file_owner,
        filename: req.body.filename,
        description: req.body.description ? req.body.description : '',
        size: 0,
        content_type: null,
        is_deleted: false,
        is_shared: false,
        is_starred: false,
        is_folder: false,
        created_at: Date.now(),
        deleted_at: null,
        last_modified_at: Date.now(),
        shared_until: null,
        directory: 'folder',
        shared_url: null,
      };
    }

    const params = {
      TableName: 'FileDirTable',
      Item: input,
    };

    const data = docClient.put(params).promise();
    console.log(JSON.stringify(data, null, 2));

    const resMessage = {
      statusCode: 200,
      success: true,
      msg: '폴더 생성 완료',
      id: id,
    };
    return resMessage;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

export const deleteFolder2 = async (req) => {};
