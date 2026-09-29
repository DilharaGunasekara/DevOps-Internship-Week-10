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

                        $bytes = [System.Text.Encoding]::UTF8.GetBytes($env:DOCKER_TOKEN)
                        $hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
                        $hashString = [BitConverter]::ToString($hash).Replace("-","").ToLower()

                        Write-Host "Token SHA256: $hashString"
                        Write-Host "Jenkins credential binding verification passed."
                    '''
                }
            }
        }

        stage('Jenkins Docker Environment Diagnostic') {
    steps {
        echo 'Checking Docker environment used by Jenkins...'

        bat '''@echo off
whoami
echo USERPROFILE=%USERPROFILE%
echo HOME=%HOME%
echo DOCKER_CONFIG=%DOCKER_CONFIG%
docker context show
docker info --format "{{.Name}}"'''
    }
}

        stage('Security Scan') {
            steps {
                echo 'Running Docker Scout security scan...'

                bat '''
                    @echo off

                    if not exist security-reports mkdir security-reports

                    docker scout cves %APP_NAME%:%APP_VERSION% > security-reports\\jenkins-security-scan.txt

                    if errorlevel 1 (
                        echo Docker Scout scan failed.
                        exit /b 1
                    )

                    type security-reports\\jenkins-security-scan.txt

                    docker scout cves %APP_NAME%:%APP_VERSION% --only-severity critical --exit-code > security-reports\\critical-scan.txt

                    if errorlevel 1 (
                        echo Critical vulnerability security gate failed.
                        exit /b 1
                    )

                    echo Critical vulnerability security gate passed.
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
                echo 'Security gate passed. Pushing hardened image to Docker Hub...'

                bat '''
                    @echo off

                    docker tag %APP_NAME%:%APP_VERSION% %DOCKER_IMAGE%

                    if errorlevel 1 (
                        echo Docker image tagging failed.
                        exit /b 1
                    )

                    docker push %DOCKER_IMAGE%

                    if errorlevel 1 (
                        echo Docker image push failed.
                        exit /b 1
                    )

                    echo Docker image pushed successfully.

                    docker logout
                '''
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
