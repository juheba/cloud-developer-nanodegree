# Overview

## Local
### Create images
```bash
docker image prune --all  # Remove unused and dangling images
docker-compose -f docker-compose-build.yaml build --parallel  # Create images locally
```

### Run containers
```bash
docker-compose up  # Start the application
```

### Stop containers & delete images
```bash
docker-compose down
docker image prune --all  # Remove unused and dangling images
```

### Verify
Visit http://localhost:8100 in your web browser to verify that the application is running.
http://localhost:8080/api/v0/feed to verify that udagram-api-feed is responding successfully.

#### Troubleshoot
1. Make sure that the environment variables are set correctly in your terminal.
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

    Use the above defined environment vars in your terminal:
    ```bash
    source ~/.profile
    ```
2. Ensure that the environment variables are read correctly while running the containers.
    ```bash
    docker-compose config
    ```
3. Rebuilding the images, you must delete the existing images locally, using:
    ```bash
    # Run from the directory where you have the compose file present
    docker-compose down
    # To delete all dangling images
    docker image prune --all
    ```
4. When you edit your code and build images multiple times, it is recommended to change the tag (say, v2, v3, v4, ....) in docker-compose.yaml and docker-compose-build.yaml files. It will help the `build` command to avoid using the dangling images. To ensure that your edits have been containerized, you can open a bash shell into the containers, and check the specific file, as:
    ```bash
    # See the list of running containers
    docker ps
    # Open bash into a particular container
    docker exec -it <container-id> bash
    # Navigate to the specific file to ensure that your edits are there. 
    cat <qualified-filename>
    ```

## CI settings
Travis job needs environment vars:
* `DOCKER_HUB_NAMESPACE`
* `DOCKER_USERNAME` neccessary for push to docker hub
* `DOCKER_PASSWORD` neccessary for push to docker hub

## CD apply environment vars, secrets & deployment
Connect with `kubectl` to the EKSCluster and run the script `script/kubectl_deploy.sh` to apply all environment vars, secrets, deployment and service yaml files.