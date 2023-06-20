# Delete Horizontal Pod Autoscaler
kubectl delete hpa udagram-api-feed
kubectl delete hpa udagram-api-user

# Service
kubectl delete service publicfrontend      # loadbalancer with public ip routing to udagram-frontend
kubectl delete service publicreverseproxy  # loadbalancer with public ip routing to reverseproxy-svc
kubectl delete service udagram-frontend-svc
kubectl delete service reverseproxy-svc
kubectl delete service udagram-api-user-svc
kubectl delete service udagram-api-feed-svc

# Deployments
kubectl delete deployment udagram-frontend
kubectl delete deployment reverseproxy
kubectl delete deployment udagram-api-user
kubectl delete deployment udagram-api-feed

# Delete env variables and secrets
kubectl delete secret aws-secret
kubectl delete secret env-secret
kubectl delete configmap env-configmap

# Remove kubectl config
kubectl config delete-cluster $(kubectl config current-context)
kubectl config delete-user $(kubectl config current-context)
kubectl config delete-context $(kubectl config current-context)
kubectl config unset current-context
sed -i 's/: null/: []/g' ~/.kube/config