# How to: Prepare environment variables, credentials & secrets

1. Copy all files from /template and paste them into this k8s folder resulting in filestructure:
    ```ascii
    k8s
    │  aws-secret.yaml   // copy
    │  env-configmap.yaml
    │  env-secret.yaml
    │  README.md         // 🔴 you are here
    └──template
        aws-secret.yaml  // original
        env-configmap.yaml
        env-secret.yaml
    ```
2. modify `aws-secret.yaml`
    * replace `___INSERT_AWS_CREDENTIALS_FILE_BASE64___` with the base64 encrypted result of your aws profile credentials
    * e.g. `cat ~/.aws/credentials | head -n 3`
        ```
        [default]
        aws_access_key_id = EXAMPLEACCESSKEYID01
        aws_secret_access_key = eXamPLesECRetAcCEssKEY0123456789EXAMPLE1
        ```
    * the result must be endoced in base64 (yes - all three lines)
        > ### **WARNING: on git bash: `cat .. | head -n3` always ends with a newline**
        > So pipeing the result of `head` direct as input to `base64` contains a newline and therefor wrong credentials.
    * e.g. input from above (without newline at the end!)
        ```
        W2RlZmF1bHRdDQphd3NfYWNjZXNzX2tleV9pZCA9IEVYQU1QTEVBQ0NFU1NLRVlJRDAxDQphd3Nfc2VjcmV0X2FjY2Vzc19rZXkgPSBlWGFtUExlc0VDUmV0QWNDRXNzS0VZMDEyMzQ1Njc4OUVYQU1QTEUx
        ```
3. modify `env-configmap.yaml`
    * replace following Strings with your config
        ```
        ___INSERT_AWS_PROFILE___    // your aws profile, e.g. default
        ___INSERT_AWS_REGION___     // your aws region, e.g eu-central-1
        ___INSERT_AWS_BUCKET___     // name, not arn, of your s3 bucket
        ___INSERT_JWT_SECRET___     // your choosen jwt secret (random string of your choice), e.g. totallynotmyjwt01
        ___INSERT_POSTGRES_HOST___  // your postgres db host entry url
        ___INSERT_POSTGRES_DB___    // name of your db
        ```
4. modify `env-secret.yaml`
    * replace `___INSERT_POSTGRES_USERNAME_BASE64___` and `___INSERT_POSTGRES_PASSWORD_BASE64___` with the base64 encoded credentials to access your db
    * e.g. `dbadmin` and `totallynotmypassword01`
        ```
        POSTGRES_USERNAME: ZGJhZG1pbg==
        POSTGRES_PASSWORD: dG90YWxseW5vdG15cGFzc3dvcmQwMQ==
        ```
        > ### **WARNING: always remember to check your username/password string if it contains unneccessary spaces or newlines**
        > So the resulting base64 string contains the exact username/password sting.