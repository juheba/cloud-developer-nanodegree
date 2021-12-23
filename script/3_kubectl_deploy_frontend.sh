# Get External-IP of the reverseproxy deployment.
EXTERNAL_ID=$(kubectl get service publicreverseproxy --output jsonpath='{.status.loadBalancer.ingress[0].hostname}')

ENVTSFILE=udagram-frontend/src/environments/environment.ts
ENVPRODTSFILE=udagram-frontend/src/environments/environment.prod.ts

# Update `udagram-frontend/src/environments/environment.ts` & `udagram-frontend/src/environments/environment.prod.ts`
# Replace the keyword `localhost` with the External-IP of the reverseproxy deployment.
sed -i "s/localhost/$EXTERNAL_ID/" $ENVTSFILE
sed -i "s/localhost/$EXTERNAL_ID/" $ENVPRODTSFILE

echo 'updated external ip'$(cat $ENVTSFILE | grep 'apiHost:')

# Build & push UI image:
docker build ./udagram-frontend -t juheba/udagram-frontend:latest
docker push juheba/udagram-frontend:latest

git checkout -- $ENVTSFILE
git checkout -- $ENVPRODTSFILE

echo 'reset'$(cat $ENVTSFILE | grep 'apiHost:')

# Update deployment: (not neccessary - new deployment)
# kubectl set image deployment udagram-frontend udagram-frontend=juheba/udagram-frontend:latest
# kubectl delete pod $(kubectl get pods -l app=udagram-frontend --output jsonpath='{.items[0].metadata.name}')

# Deployments
kubectl apply -f udagram-frontend/deploy/deployment.yaml

# Service
kubectl apply -f udagram-frontend/deploy/service.yaml

# Expose public IPs
kubectl expose deployment udagram-frontend --type=LoadBalancer --name=publicfrontend

echo 'open http://'$(kubectl get service publicfrontend --output jsonpath='{.status.loadBalancer.ingress[0].hostname}')' in browser to visit udagram'