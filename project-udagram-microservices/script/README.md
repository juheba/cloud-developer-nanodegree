# How to: Prepare local environment variables, credentials & secrets

## Temporarly environment setup
1. Copy `set_env.sh` from /template and paste it into this scripts folder resulting in filestructure:
    ```ascii
    scripts
    │  1_kubectl_setup.sh
    │  2_kubectl_deploy_backend.sh
    │  3_kubectl_deploy_frontend.sh
    │  4_collect_log_snapshots.sh
    │  5_kubectl_cleanup.sh
    │  README.md      // 🔴 you are here
    │  set_env.sh     // copy
    └───template
          set_env.sh  // original
    ```
2. modify `set_env.sh` and complete all following variables with your config
    ```
    export POSTGRES_USERNAME=  // plain text username to access your db
    export POSTGRES_PASSWORD=  // plain text password to access your db
    export POSTGRES_HOST=      // your postgres db host entry url
    export POSTGRES_DB=        // name of your db
    export AWS_BUCKET=         // name, not arn, of your s3 bucket
    export AWS_REGION=         // your aws region, e.g eu-central-1
    export AWS_PROFILE=        // your aws profile, e.g. default
    export JWT_SECRET=         // your choosen jwt secret (random string of your choice), e.g. totallynotmyjwt01
    export URL=                // application entry url, e.g. http://localhost:8080
    ```
3. run `set_env.sh` from command line: `./set_env.sh`

## Permanently environment setup
1. create file `~/.profile`
2. add following environment vars to `~/.profile`

        export POSTGRES_USERNAME=  // plain text username to access your db
        export POSTGRES_PASSWORD=  // plain text password to access your db
        export POSTGRES_HOST=      // your postgres db host entry url
        export POSTGRES_DB=        // name of your db
        export AWS_BUCKET=         // name, not arn, of your s3 bucket
        export AWS_REGION=         // your aws region, e.g eu-central-1
        export AWS_PROFILE=        // your aws profile, e.g. default
        export JWT_SECRET=         // your choosen jwt secret (random string of your choice), e.g. totallynotmyjwt01
        export URL=                // application entry url, e.g. http://localhost:8080

3. set environment vars permanently with `source ~/.profile`

# How to: Setup kubectl & deploy aws services
Simply run the following scripts
```bash
# Setup local kubectl config
./1_kubectl_setup.sh
# Apply env variables and secrets
# then deploy backend services (udagram-api-feed-svc, udagram-api-user-svc & reverseproxy-svc)
# then expose public IP of reverseproxy
# then setup kubectl metrics server and hpa for udagram-api-feed and udagram-api-user
./2_kubectl_deploy_backend.sh
# Replace backend localhost url with publicreverseproxy external ip url and deploy frontend service
# then expose public IP of udagram-frontend
./3_kubectl_deploy_frontend.sh
```
* Test the services
* Produce some load on the backend services
* Collect log snapshots
```bash
# Output is stored in /log-snapshots
./4_collect_log_snapshots.sh
```

# How to: Teardown & cleanup
Simply run the following script
```bash
# Deletes hpas, services, deployments, environment vars and secrets
# then remove local kubectl config
./5_kubectl_cleanup.sh
```