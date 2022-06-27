# Quickstart
```sh
# Backend
npm i       # classic install
sls deploy  # deploy serverless template to aws
MY_IP_ADDRESS=$(curl https://checkip.amazonaws.com/) sls deploy  # deploy with environment variables (in this case MY_IP_ADDRESS to substitute the current ip address)
sls remove  # remove infrastructure and cloudformation template from aws

# Connecting to the websocket
# Remember nk6wxcr9j1 is a generated api id
wscat -c wss://2gt4tl2bni.execute-api.eu-central-1.amazonaws.com/dev

# Frontend
# set base url in config.ts
# Remember set base url of the api gateway (not the base url of websocket)!
npm run start  # hosts on http://localhost:3000/
```