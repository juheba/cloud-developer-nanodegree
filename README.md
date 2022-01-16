# Overview

## Local setup with docker compose
### Create images
```bash
docker image prune --all  # Remove unused and dangling images
docker-compose -f docker-compose-build.yaml build --parallel  # Create images locally
```

### Run containers
```bash
docker-compose up  # Start the application
```
### Verify
Visit http://localhost:8100 in your web browser to verify that the application is running.
http://localhost:8080/api/v0/feed to verify that udagram-api-feed is responding successfully.

### Stop containers & delete images
```bash
docker-compose down
docker image prune --all  # Remove unused and dangling images
```


#### Troubleshoot
Make sure that the environment variables are set correctly in your terminal.
```bash
# Set the environment variables permanently in `~/.profile` file:
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

Use the above defined environment vars in your terminal:
```bash
source ~/.profile
```

```bash
# Ensure that the environment variables are read correctly while running the containers.
docker-compose config

# Rebuilding the images, you must delete the existing images locally, using:
# Run from the directory where you have the compose file present
docker-compose down
# To delete all dangling images
docker image prune --all

# See the list of running containers
docker ps

# Open bash into a particular container
docker exec -it <container-id> bash
```

---

## CI settings
Travis job needs environment vars:
* `DOCKER_HUB_NAMESPACE`
* `DOCKER_USERNAME` neccessary for push to docker hub
* `DOCKER_PASSWORD` neccessary for push to docker hub

---

## CD apply environment vars, secrets & deployment
1. Connect with `kubectl` to the EKSCluster by running script `scripts/1_kubectl_setup.sh`.
 2. Then run the script `scripts/2_kubectl_deploy_backend.sh` to apply all environment vars and secrets yaml and only the backend deployment and service yaml files.

## Troubleshooting
```bash
kubectl logs <pod-name>
kubectl exec -it <pod-name> bash
```

## Expose public IPs (already created by 2_kubectl_deploy_backend.sh)
```bash
kubectl expose deployment reverseproxy --type=LoadBalancer --name=publicreverseproxy
kubectl expose deployment udagram-frontend --type=LoadBalancer --name=publicfrontend
kubectl get services  # check created publicfrontend & publicreverseproxy

# Verify reverseproxy loadbalancer
curl http://<publicreverseproxy EXTERNAL-IP>:8080/api/v0/feed
```

## Deploy UI
Run the script `scripts/3_kubectl_deploy_frontend.sh` to apply the frontend deployment and service yaml files.

Update `udagram-frontend/src/environments/environment.ts` & `udagram-frontend/src/environments/environment.prod.ts`:
Replace the keyword `localhost` in the `http://localhost:8080/api/v0` string with the External-IP of the reverseproxy deployment.
```bash
# Build & push UI image:
docker build . -t juheba/udagram-frontend:latest
docker push juheba/udagram-frontend:latest
# Update deployment:
kubectl set image deployment udagram-frontend udagram-frontend=juheba/udagram-frontend:latest

# Troubleshoot external-ip
kubectl exec -it $(kubectl get pods -l app=udagram-frontend --output jsonpath='{.items[0].metadata.name}') sh
cat usr/share/nginx/html/main.js | grep 'apiHost:'
```

## Verify
```bash
kubectl get secret
kubectl get configmap
kubectl get deployment
kubectl get service
kubectl get pod
kubectl get hpa

kubectl logs $(kubectl get pods -l app=udagram-api-feed --output jsonpath='{.items[0].metadata.name}')
kubectl logs $(kubectl get pods -l app=udagram-api-user --output jsonpath='{.items[0].metadata.name}')
kubectl logs $(kubectl get pods -l service=reverseproxy --output jsonpath='{.items[0].metadata.name}')
kubectl logs $(kubectl get pods -l app=udagram-frontend --output jsonpath='{.items[0].metadata.name}')
```