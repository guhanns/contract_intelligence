#!/bin/bash
set -e

AWS_REGION="ap-south-1"
FRONTEND_REPO="850550314808.dkr.ecr.ap-south-1.amazonaws.com/intellicontract/frontend"
IMAGE_TAG="p${CODEBUILD_BUILD_NUMBER}"
FRONTEND_CONTAINER="frontend"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $FRONTEND_REPO

# Stop and remove existing container
docker ps -q --filter "name=$FRONTEND_CONTAINER" | grep -q . && docker stop $FRONTEND_CONTAINER && docker rm $FRONTEND_CONTAINER || echo "No frontend container running"

# Pull latest image
docker pull $FRONTEND_REPO:$IMAGE_TAG

# Run container
docker run -d --name $FRONTEND_CONTAINER -p 3000:80 $FRONTEND_REPO:$IMAGE_TAG

echo "Frontend deployment completed."