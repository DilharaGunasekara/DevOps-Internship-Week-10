pipeline {
    agent any

    environment {
        APP_NAME = 'week10-app'
        APP_VERSION = 'v3'
        DOCKERHUB_USERNAME = 'dilharadockerhub'
        DOCKER_IMAGE = "${DOCKERHUB_USERNAME}/${APP_NAME}:${APP_VERSION}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Verification') {
            steps {
                echo 'Verifying Week 10 build environment...'
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Automated Tests') {
            steps {
                echo 'Running automated tests...'
                sh 'npm test'
            }
        }

        stage('Build Hardened Docker Image') {
            steps {
                echo 'Building hardened Docker image...'
                sh 'docker build -t ${APP_NAME}:${APP_VERSION} .'
            }
        }

        stage('Verify Container Security') {
            steps {
                echo 'Verifying container runs as a non-root user...'
                sh '''
                    USER_NAME=$(docker inspect ${APP_NAME}:${APP_VERSION} --format '{{.Config.User}}')
                    echo "Configured container user: $USER_NAME"

                    if [ "$USER_NAME" = "root" ] || [ -z "$USER_NAME" ]; then
                        echo "Security check failed: container is configured to run as root."
                        exit 1
                    fi
                '''
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Scanning Docker image with Docker Scout...'
                sh '''
                    mkdir -p security-reports
                    docker scout cves ${APP_NAME}:${APP_VERSION} \
                        > security-reports/jenkins-security-scan.txt

                    cat security-reports/jenkins-security-scan.txt

                    docker scout cves ${APP_NAME}:${APP_VERSION} \
                        --only-severity critical \
                        --exit-code \
                        > security-reports/critical-scan.txt
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'security-reports/*.txt',
                                     fingerprint: true
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Security checks passed. Pushing image to Docker Hub...'

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    sh '''
                        echo "$DOCKER_TOKEN" | docker login \
                            -u "$DOCKER_USER" --password-stdin

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
            echo 'Week 10 DevSecOps pipeline completed successfully!'
        }

        failure {
            echo 'Week 10 DevSecOps pipeline failed. Review test or security findings.'
        }

        always {
            echo 'Week 10 production readiness pipeline finished.'
        }
    }
}
