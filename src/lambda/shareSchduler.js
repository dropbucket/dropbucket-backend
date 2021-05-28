var AWS = require("aws-sdk");

AWS.config.update({
    aws_access_key_id :'ASIAXX7YHWZBGTGEPG44',
    aws_secret_access_key:'84DVXd92iR1T0pSP5aEcPq+ZIfdor320H7Z54Rq0',
    region: 'us-east-1'
});

var docClient = new AWS.DynamoDB.DocumentClient()
const SETDATE = String(Date.now()-60*60*24*7); //일단 1시간으로 했습니다.

const s3 = new AWS.S3({accessKeyId:'AKIAWG4SZCKG32YCV3UK', secretAccessKey:'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'});
const BUCKET_NAME = 'khudropbucket'

//scan을 위한 parameter
//shared_at이 SETDATE(현재 시간으로부터 일주일 전) 보다 작으면(공유된지 일주일 이상이 지났으면) 더이상 공유되지 않도록 함
var params = {
    TableName: "FileDirTable",
    ProjectionExpression: "id",    
    FilterExpression: "#is_shared = :i and #date between :start and :end",
        ExpressionAttributeNames: {
            "#date": "shared_at",
            "#is_shared" : "is_shared"
        },
        ExpressionAttributeValues: {
             ":start": '0',
             ":end": SETDATE,
             ":i" : true
        }

}

console.log(SETDATE)

//scan
docClient.scan(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to read table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else { //공유된지 하루 이상 된 파일들 가져옴
      console.log(
        "read table. read description JSON:",
        JSON.stringify(data, null, 2)
      );

      //더이상 공유되지 않도록 함
      //is_shared 를 false로 바꿈
      for(iter = 0 ; iter<data.Items.length;iter++){
        var params_DB = {
            TableName:"FileDirTable",
            Key:{
                "id" : data.Items[iter].id
            },
            UpdateExpression: "set is_shared = :i",
            ExpressionAttributeValues:{
                ":i":false
            },
        };
        docClient.update(params_DB, function(err, data) {
          if (err) {
              console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
          } 
          else {
              console.log("공유 중단 완료:", JSON.stringify(data, null, 2));
          }
      });
    }
  }
});