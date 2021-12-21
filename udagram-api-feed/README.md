# Udagram Image Filtering Backend: 📷 Feed API

RESTful API - Node-Express application

This simple microservice provides endpoints to interact with the feed resource.

## ⏩ Local quickstart

Set the environment variables permanently in `~/.profile` file:
```bash
export POSTGRES_USERNAME=
export POSTGRES_PASSWORD=
export POSTGRES_HOST=
export POSTGRES_DB=
export AWS_BUCKET=<BUCKET_NAME_NOT_ARN>
export AWS_REGION=
export AWS_PROFILE=default
export JWT_SECRET=
export URL=http://localhost:8080
```

Install dependencies & run:
```bash
source ~/.profile  # use the above defined environment vars

npm install .

npm run dev
```

**Verify**: Visit http://localhost:8080/api/v0/feed in web browser to verify that the application is running.