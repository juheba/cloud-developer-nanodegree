# Kubectl config
export AWS_EKS_CLUSTER=UdagramEKSCluster
aws eks --region $AWS_REGION update-kubeconfig --name $AWS_EKS_CLUSTER