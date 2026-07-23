pipeline {
    agent any

    environment {
        AWS_REGISTRY = "123456789012.dkr.ecr.us-east-1.amazonaws.com"
        IMAGE_NAME   = "prepwise-ai"
        AWS_REGION   = "us-east-1"
    }

    stages {
        stage('Repository Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Linter & Static Analysis') {
            steps {
                sh 'npm install'
                sh 'npm run lint'
            }
        }

        stage('Dockerize Build') {
            steps {
                script {
                    sh "docker build -t ${AWS_REGISTRY}/${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('AWS Authenticate & Push') {
            steps {
                script {
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-ci-cd-credentials'
                    ]]) {
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_REGISTRY}"
                        sh "docker push ${AWS_REGISTRY}/${IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('Rolling Deployment to AWS') {
            steps {
                sh "aws ecs update-service --cluster prepwise-production-cluster --service prepwise-production-service --force-new-deployment --region ${AWS_REGION}"
            }
        }
    }
}
