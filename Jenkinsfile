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
                bat 'docker scout version'
            }
        }

        stage('Automated Tests') {
            steps {
                echo 'Running Week 10 automated tests...'
                bat 'npm test'
            }
        }

        stage('Build Hardened Docker Image') {
            steps {
                echo 'Building hardened Week 10 Docker image...'
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

        stage('Verify Docker Credentials') {
            steps {
                echo 'Verifying Jenkins Docker Hub credential binding...'

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    powershell '''
                        Write-Host "Docker username from Jenkins: $env:DOCKER_USER"

                        if ([string]::IsNullOrWhiteSpace($env:DOCKER_USER)) {
                            Write-Error "DOCKER_USER is empty."
                            exit 1
                        }

                        if ([string]::IsNullOrWhiteSpace($env:DOCKER_TOKEN)) {
                            Write-Error "DOCKER_TOKEN is empty."
                            exit 1
                        }

                        Write-Host "Docker token loaded by Jenkins."
                        Write-Host "Token length: $($env:DOCKER_TOKEN.Length)"
                        Write-Host "Jenkins credential binding verification passed."
                    '''
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Authenticating Docker Scout and scanning the hardened image...'

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    powershell '''
    Write-Host "Docker username from Jenkins: $env:DOCKER_USER"

    if ([string]::IsNullOrWhiteSpace($env:DOCKER_USER)) {
        Write-Error "DOCKER_USER is empty."
        exit 1
    }

    if ([string]::IsNullOrWhiteSpace($env:DOCKER_TOKEN)) {
        Write-Error "DOCKER_TOKEN is empty."
        exit 1
    }

    Write-Host "Docker token loaded by Jenkins."
    Write-Host "Token length: $($env:DOCKER_TOKEN.Length)"

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($env:DOCKER_TOKEN)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $hash = $sha.ComputeHash($bytes)
    $fingerprint = [BitConverter]::ToString($hash).Replace("-","").ToLower()

    Write-Host "Token SHA256: $fingerprint"
    Write-Host "Jenkins credential binding verification passed."
'''

                        docker logout
                    '''
                }
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
                echo 'Security gate passed. Pushing hardened image to Docker Hub...'

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    powershell '''
                        $env:DOCKER_TOKEN | docker login -u $env:DOCKER_USER --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            Write-Error "Docker Hub authentication failed before push."
                            exit 1
                        }

                        docker tag "$env:APP_NAME`:$env:APP_VERSION" "$env:DOCKER_IMAGE"

                        if ($LASTEXITCODE -ne 0) {
                            Write-Error "Docker image tagging failed."
                            docker logout
                            exit 1
                        }

                        docker push "$env:DOCKER_IMAGE"

                        if ($LASTEXITCODE -ne 0) {
                            Write-Error "Docker image push failed."
                            docker logout
                            exit 1
                        }

                        Write-Host "Docker image pushed successfully."

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
            echo 'Week 10 DevSecOps pipeline failed. Review the stage that failed.'
        }

        always {
            echo 'Week 10 production readiness pipeline finished.'
        }
    }
}
