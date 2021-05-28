exports.handler = async (event) => {
    // TODO implement
    const SETDATE = Date.now()-60*60*24; //일단 1시간으로 했습니다.
    var params = {
        TableName: "FileDirTable",
        KeyConditionExpression: "is_deleted = :i and deleted_at <= :d",
        ExpressionAttributeValues: {
            ":a": true,
            ":d": String(SETDATE)

        }
    }

    docClient.get(params, function (err, data) {
        if (err) {
          console.error(
            "Unable to read table. Error JSON:",
            JSON.stringify(err, null, 2)
          );
        } else {
          console.log(
            "read table. read description JSON:",
            JSON.stringify(data, null, 2)
          );
        }
      });
    
    
};
