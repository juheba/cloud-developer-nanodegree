# Overview
This is a very simple, bare-bones NodeJS and ExpressJS project created for you to use with Docker.

# Local Setup
* Install dependencies: `npm install`
* Run server: `node server.js`

# Usage
By default, the application should be loaded on `localhost:8080`. It should provide an HTTP 200 response when loaded at `localhost:8080/health`.

# Container Setup
* Build image: `docker build .`
* Build image with tag name: `docker build -t {image_tag_name} .` where `image_tag_name` is the tag name of a image.
* Build image with command line args: `docker build --build-arg ARG_VARNAME=${ENVIRONMENT_VARIABLE} .` where `ENVIRONMENT_VARIABLE` is a environment variable.
* Run container with image: `docker run {image_id}` where `image_id` can be retrieved by running `docker images` and found under the column `IMAGE ID`

# Container teardown
* Remove container: `docker kill {container_id}` where `container_id` can be retrieved by running `docker ps` and found under the column `CONTAINER ID`
* Quicker: `docker kill $(docker ps --filter ancestor={image_tag_name} --quiet)` where `image_tag_name` is the tag name of a image.

# Useful Docker Hub commands
* `docker build -t {image_tag_name} .` builds a image with an tag name.
* `docker tag {image_tag_name} {docker_hub_namespace}/{docker_hub_repository_name}:latest` linking an existing image (by tag name `{image_tag_name}`) to an newly created tag name `{docker_hub_namespace}/{docker_hub_repository_name}:latest`  with the docker hub namespace & repository name to ease an upload to docker hub.
* `docker push {docker_hub_namespace}/{docker_hub_repository_name}` pushes/uploads a container image to docker hub.
* `docker pull {docker_hub_namespace}/{docker_hub_repository_name}` pulls/downloads a container image from docker hub.