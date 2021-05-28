var AWS = require("aws-sdk");

AWS.config.update({
    aws_access_key_id :'ASIAXX7YHWZBLQBWQX2T',
    aws_secret_access_key:'8iDHb0s0YFlirJWyBQEEtRZ3OkIwkZm7FxBxD2QW',
    region: 'us-east-1'
});

var docClient = new AWS.DynamoDB.DocumentClient()
const SETDATE = String(Date.now()-60*60*24); //일단 1시간으로 했습니다.

const s3 = new AWS.S3({accessKeyId:'AKIAWG4SZCKG32YCV3UK', secretAccessKey:'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'});
const BUCKET_NAME = 'khudropbucket'

//scan을 위한 parameter
//deleted_at이 SETDATE(현재 시간으로부터 1일 전) 보다 작으면(삭제된지 하루 이상이 지났으면) 삭제하도록 함
var params = {
    TableName: "FileDirTable",
    ProjectionExpression: "id",    
    FilterExpression: "#date between :start and :end and #is_deleted = :i",
        ExpressionAttributeNames: {
            "#date": "deleted_at",
            "#is_deleted" : "is_deleted"
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
    } else { //삭제된지 하루 이상 된 파일들 가져옴
      console.log(
        "read table. read description JSON:",
        JSON.stringify(data, null, 2)
      );

      //s3 지우기
      var iter;
      for(iter = 0 ; iter<data.Items.length;iter++){
        const params_s3 = {
          Bucket: BUCKET_NAME,
          Key: data.Items[iter].id
        };
  
        s3.deleteObject(params_s3,function(err,data_s3){
          if(err){
              throw err;
          }
        })
      }

      //DB에서 지우기
      for(iter = 0 ; iter<data.Items.length;iter++){
        var params_DB = {
          TableName:"FileDirTable",
          Key:{
              "id" : data.Items[iter].id
            }
        };
        docClient.delete(params_DB, function(err, data) {
          if (err) {
              console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
          } 
          else {
              console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
          }
      });
    }
  }
});