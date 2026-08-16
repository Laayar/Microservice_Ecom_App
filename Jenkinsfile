// auth-service/Jenkinsfile

pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO  = 'laayardev/auth-service'
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        IMAGE_TAG        = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Code checked out — Branch: ${env.BRANCH_NAME}"
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('auth-service') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('auth-service') {
                    sh 'npm test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                dir('auth-service') {
                    sh "docker build -t ${DOCKER_HUB_REPO}:${IMAGE_TAG} ."
                    sh "docker tag ${DOCKER_HUB_REPO}:${IMAGE_TAG} ${DOCKER_HUB_REPO}:latest"
                }
            }
        }

        stage('Docker Push') {
            steps {
                sh "echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin"
                sh "docker push ${DOCKER_HUB_REPO}:${IMAGE_TAG}"
                sh "docker push ${DOCKER_HUB_REPO}:latest"
            }
        }

        stage('Deploy to Cloud') {
            when {
                branch 'main'
            }
            steps {
                sshagent(['cloud-server-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no user@your-server-ip '
                            docker pull ${DOCKER_HUB_REPO}:latest &&
                            docker stop auth-service || true &&
                            docker rm auth-service || true &&
                            docker run -d \
                                --name auth-service \
                                -p 5000:5000 \
                                --env-file /home/user/.env.auth \
                                --restart unless-stopped \
                                ${DOCKER_HUB_REPO}:latest
                        '
                    """
                }
            }
        }
    }

    post {
        success { echo "Pipeline succeeded! auth-service is live." }
        failure { echo "Pipeline failed. Check logs above." }
        always  { sh 'docker logout' }
    }
}
