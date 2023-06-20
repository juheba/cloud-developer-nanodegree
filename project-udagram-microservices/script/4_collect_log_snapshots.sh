OUTPUT_FOLDER=log-snapshots

kubectl get pods > $OUTPUT_FOLDER/kubectl_get_pods_output.txt

kubectl describe services > $OUTPUT_FOLDER/kubectl_describe_services_output.txt

kubectl describe hpa > $OUTPUT_FOLDER/kubectl_describe_hpa_output.txt

kubectl describe deployment > $OUTPUT_FOLDER/kubectl_describe_deployment_output.txt

kubectl get service > $OUTPUT_FOLDER/kubectl_get_service.txt

kubectl get hpa > $OUTPUT_FOLDER/kubectl_get_hpa.txt

kubectl get secret > $OUTPUT_FOLDER/kubectl_get_secret.txt

kubectl get configmap > $OUTPUT_FOLDER/kubectl_get_configmap.txt

kubectl logs $(kubectl get pods -l app=udagram-api-feed --output jsonpath='{.items[0].metadata.name}') > $OUTPUT_FOLDER/kubectl_logs_udagram-api-feed.txt

kubectl logs $(kubectl get pods -l app=udagram-api-user --output jsonpath='{.items[0].metadata.name}') > $OUTPUT_FOLDER/kubectl_logs_udagram-user-feed.txt