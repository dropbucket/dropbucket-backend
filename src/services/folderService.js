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

    if (owner.parent_id === file_owner) {
      return {
        statusCode: 400,
        success: false,
        msg: '루트폴더는 이름과 설명을 변경할 수 없습니다.',
      };
    }

    // 폴더 주인 및 폴더인지 확인
    if (file_owner !== owner.file_owner) {
      return {
        statusCode: 400,
        success: false,
        msg: '권한이 없습니다.',
      };
    }

    if (owner.is_folder !== true) {
      return {
        statusCode: 400,
        success: false,
        msg: '폴더id가 아닌 파일id가 들어왔습니다.',
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

      // 폴더명 중복 체크 , 폴더끼리만 체크
      for (let i = 0; i < folders.length; i++) {
        if (
          folders[i].filename === req.body.change_foldername &&
          folders[i].parent_id === owner.parent_id &&
          folders[i].is_folder
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
          folders[i].parent_id === owner.parent_id &&
          folders[i].is_folder
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

    if (file_owner === moveF.parent_id) {
      return {
        statusCode: 400,
        success: false,
        msg: '루트폴더의 경로는 변경할 수 없습니다.',
      };
    }

    // 폴더이름
    const folderName = moveF.filename;

    // 폴더 주인 및 폴더인지 확인
    if (file_owner !== owner.file_owner) {
      return {
        statusCode: 400,
        success: false,
        msg: '권한이 없습니다.',
      };
    }

    if (owner.is_folder !== true) {
      return {
        statusCode: 400,
        success: false,
        msg: '폴더id가 아닌 파일id가 들어왔습니다.',
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
        folders[i].parent_id === req.body.location_id &&
        folders[i].is_folder
      ) {
        return {
          statusCode: 400,
          success: false,
          msg: '폴더 이름이 중복됩니다.',
        };
      }
    }
    /*
    폴더 사이즈는 따로 계산할 필요 없을것같음. 필요없다고 확인하면 그냥 지우기
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
        is_folder: true,
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
          msg: '권한이 없습니다.',
        };
      }

      // parent가 폴더인지 확인
      if (folders[parentFolder].is_folder !== true) {
        return {
          statusCode: 400,
          success: false,
          msg: '폴더가 아닌곳에 폴더를 생성할 수 없습니다.',
        };
      }
      // 파일명 중복 체크
      for (let i = 0; i < folders.length; i++) {
        if (
          folders[i].filename === req.body.filename &&
          folders[i].parent_id === req.body.parent_id &&
          folders[i].is_folder
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
        is_folder: true,
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

export const deleteFolder2 = async (req) => {
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

    if (file_owner === deleteF.parent_id) {
      return {
        statusCode: 400,
        success: false,
        msg: '루트폴더는 삭제할 수 없습니다.',
      };
    }

    // 폴더이름
    const folderName = deleteF.filename;

    // 폴더 주인 확인
    if (file_owner !== deleteF.file_owner) {
      return {
        statusCode: 400,
        success: false,
        msg: '권한이 없습니다.',
      };
    }

    // 폴더인자 확인
    if (deleteF.is_folder !== true) {
      return {
        statusCode: 400,
        success: false,
        msg: '폴더id가 아닌 파일id가 들어왔습니다.',
      };
    }

    if (deleteF.is_deleted) {
      return {
        statusCode: 400,
        success: false,
        msg: '이미 삭제된 폴더 입니다.',
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
        folders[i].is_deleted &&
        folders[i].is_folder
      ) {
        return {
          statusCode: 400,
          success: false,
          msg: '휴지통에 이미 중복된 이름의 폴더가 존재합니다.',
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
      msg: '폴더 삭제 완료',
    };
    return resMessage;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};

export const restoreFolder2 = async (req) => {
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
    const folderName = deleteF.filename;

    // 폴더 주인 확인
    if (file_owner !== deleteF.file_owner) {
      return {
        statusCode: 400,
        success: false,
        msg: '권한이 없습니다.',
      };
    }

    // 폴더인지 확인
    if (deleteF.is_folder !== true) {
      return {
        statusCode: 400,
        success: false,
        msg: '폴더id가 아닌 파일id가 들어왔습니다.',
      };
    }

    if (deleteF.is_deleted === false) {
      return {
        statusCode: 400,
        success: false,
        msg: '삭제되지 않은 폴더입니다.',
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

    // 상위 폴더가 is_deleted 상태인지 확인. 상위폴더가 삭제상태이면
    // 해당 폴더를 parent_id를 루트폴더로해서 복구한다.
    let up_foloder_idx = -1;
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].id === deleteF.parent_id) {
        up_foloder_idx = i;
        break;
      }
    }

    let change;

    // 상위폴더가 삭제되어있는 경우
    if (folders[up_foloder_idx].is_deleted === true) {
      let root_idx;
      for (let i = 0; i < folders.length; i++) {
        if (folders[i].parent_id === file_owner) {
          root_idx = i;
          break;
        }
      }

      // 파일명 중복 체크
      // 삭제되지 않았어야 하고
      // 폴더여야하고, 부모아이디와 루트 소속인데
      // 폴더명이 같다? 그러면 중복
      for (let i = 0; i < folders.length; i++) {
        if (
          folderName === folders[i].filename &&
          folders[i].is_deleted !== true &&
          folders[i].is_folder &&
          folders[i].parent_id === folders[root_idx].id
        ) {
          return {
            statusCode: 400,
            success: false,
            msg: '복구하려는 곳에 이미 중복된 이름의 폴더가 존재합니다.',
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
          'SET #parent_id = :parent_id, #is_deleted = :is_deleted, #deleted_at = :deleted_at',
        ExpressionAttributeNames: {
          '#parent_id': 'parent_id',
          '#is_deleted': 'is_deleted',
          '#deleted_at': 'deleted_at',
          //'#size': 'size',
        },
        // 위에서 고른것을 변경한다. 이때 지정해준 이름을 사용해야 한다.
        ExpressionAttributeValues: {
          ':is_deleted': false,
          ':parent_id': folders[root_idx].id,
          ':deleted_at': null,
          //'#size': location_parent_size + moveF.size,
        },
        ReturnValues: 'UPDATED_NEW',
      };
    } else {
      // 폴더 이름 중복 체크
      for (let i = 0; i < folders.length; i++) {
        if (
          folderName === folders[i].filename &&
          folders[i].is_deleted !== true &&
          folders[i].is_folder &&
          folders[i].parent_id === deleteF.parent_id
        ) {
          return {
            statusCode: 400,
            success: false,
            msg: '복구하려는 곳에 이미 중복된 이름의 폴더가 존재합니다.',
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
          'SET #is_deleted = :is_deleted, #deleted_at = :deleted_at',
        ExpressionAttributeNames: {
          '#is_deleted': 'is_deleted',
          '#deleted_at': 'deleted_at',
          //'#size': 'size',
        },
        // 위에서 고른것을 변경한다. 이때 지정해준 이름을 사용해야 한다.
        ExpressionAttributeValues: {
          ':is_deleted': false,
          ':deleted_at': null,
          //'#size': location_parent_size + moveF.size,
        },
        ReturnValues: 'UPDATED_NEW',
      };
    }

    const data = docClient.update(change).promise();

    const resMessage = {
      statusCode: 200,
      success: true,
      msg: '폴더 복구 완료',
    };
    return resMessage;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
};
