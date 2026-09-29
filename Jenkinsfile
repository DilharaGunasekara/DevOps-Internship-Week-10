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
                bat 'node --version'
                bat 'npm --version'
                bat 'docker --version'
            }
        }

        stage('Automated Tests') {
            steps {
                echo 'Running automated tests...'
                bat 'npm test'
            }
        }

        stage('Build Hardened Docker Image') {
            steps {
                echo 'Building hardened Docker image...'
                bat 'docker build -t %APP_NAME%:%APP_VERSION% .'
            }
        }

        stage('Verify Container Security') {
            steps {
                echo 'Verifying container runs as a non-root user...'
                powershell '''
                    $userName = docker inspect "$env:APP_NAME`:$env:APP_VERSION" --format '{{.Config.User}}'
                    Write-Host "Configured container user: $userName"

                    if ([string]::IsNullOrWhiteSpace($userName) -or $userName -eq "root") {
                        Write-Error "Security check failed: container is configured to run as root."
                        exit 1
                    }

                    Write-Host "Non-root container security check passed."
                '''
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Scanning Docker image with Docker Scout...'

                bat '''
                    if not exist security-reports mkdir security-reports

                    docker scout cves %APP_NAME%:%APP_VERSION% > security-reports\\jenkins-security-scan.txt

                    type security-reports\\jenkins-security-scan.txt

                    docker scout cves %APP_NAME%:%APP_VERSION% --only-severity critical --exit-code > security-reports\\critical-scan.txt
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
                    bat '''
                        echo %DOCKER_TOKEN% | docker login -u %DOCKER_USER% --password-stdin

                        docker tag %APP_NAME%:%APP_VERSION% %DOCKER_IMAGE%
                        docker push %DOCKER_IMAGE%
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
