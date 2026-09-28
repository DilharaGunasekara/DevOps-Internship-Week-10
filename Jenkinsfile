pipeline {
    agent any

    environment {
    APP_NAME = 'week09-app'
    APP_VERSION = 'v2'
    DOCKERHUB_USERNAME = 'dilharadockerhub'
    DOCKER_IMAGE = "${DOCKERHUB_USERNAME}/${APP_NAME}:${APP_VERSION}"
}

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building Week 09 application...'
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Test') {
            steps {
                echo 'Running automated tests...'
                sh 'npm test'
            }
        }

        stage('Package') {
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t ${APP_NAME}:${APP_VERSION} .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing Docker image to Docker Hub...'

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    sh '''
                        echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USER" --password-stdin
                        docker tag ${APP_NAME}:${APP_VERSION} ${DOCKER_IMAGE}
                        docker push ${DOCKER_IMAGE}
                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Week 09 CI pipeline completed successfully!'
        }

        failure {
            echo 'Week 09 CI pipeline failed.'
        }
    }
} 
