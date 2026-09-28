# DevOps Internship - Week 09

## Advanced CI/CD & Deployment Strategies

This project demonstrates an automated CI/CD pipeline using Jenkins, GitHub, Docker, Docker Hub, and Docker Swarm. The pipeline builds and tests a Node.js application, creates a Docker image, pushes the image to Docker Hub, and supports rolling deployment and rollback.

## Technologies Used

- Git & GitHub
- Jenkins
- Node.js
- Docker
- Docker Hub
- Docker Swarm
- WSL Ubuntu

## CI/CD Architecture

The workflow used in this project is:

GitHub → Jenkins → Build → Test → Docker → Docker Hub → Docker Swarm → Deploy → Verify → Rollback

## Jenkins Pipeline

The Jenkins pipeline is defined using a `Jenkinsfile` stored in the GitHub repository.

The pipeline contains the following stages:

1. Checkout
2. Build
3. Test
4. Package
5. Push to Docker Hub

### Checkout

Jenkins retrieves the latest source code from GitHub.

### Build

The pipeline verifies the Node.js and npm environment required by the application.

### Test

Automated application tests are executed using:

```bash
npm test
