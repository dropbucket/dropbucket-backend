## dropbuckey-backend

- 코드 일관성을 위해 prettier사용
- eslint를 쓰면 너무 복잡해질 것 같아 사용x

- config/awsconfig.json 에 aws설정을 넣기

  ```json
  {
    "accessKeyId": "",
    "secretAccessKey": "",
    "sessionToken": "",
    "region": "us-east-1"
  }
  ```

* 이런식으로 저장해서 넣으면된다. gitignore에 config 폴더를 설정해놓아서 직접 만들어야한다

* 위의 config를 설정했으면 아래 명령어를 통해 시작.

  ```
  npm install
  npm start
  ```

* testing 은 postman 과 같은 툴 등을 이용하여 확인.
