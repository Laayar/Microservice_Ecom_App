// Jenkinsfile

pipeline {
  agent any
  environment {
    GHCR_IMAGE = 'ghcr.io/laayar/auth-service'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }
  stages {
    stage('Run Tests') {
      steps {
        dir('auth-service') {
          sh '''
            tar -czf - --exclude=node_modules --exclude=coverage --exclude=.git --exclude='.env*' . | \
              docker run --rm -i -w /app node:22-alpine \
              sh -c 'tar -xzf - -C /app && npm ci && npm run test:ci && npm run test:coverage'
          '''
        }
      }
    }
    stage('Docker Build') {
      steps {
        dir('auth-service') {
          sh "docker build -t ${GHCR_IMAGE}:${IMAGE_TAG} ."
          sh "docker tag ${GHCR_IMAGE}:${IMAGE_TAG} ${GHCR_IMAGE}:latest"
        }
      }
    }
    stage('Docker Push') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'github-container-registry',
          usernameVariable: 'GHCR_USERNAME',
          passwordVariable: 'GHCR_TOKEN'
        )]) {
          sh '''
                echo "$GHCR_TOKEN" | docker login ghcr.io \
                    --username "$GHCR_USERNAME" \
                    --password-stdin

                docker push "$GHCR_IMAGE:$IMAGE_TAG"
                docker push "$GHCR_IMAGE:latest"
            '''
        }
      }
    }
    stage('Deploy to Cloud') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'github-container-registry',
          usernameVariable: 'GHCR_USERNAME',
          passwordVariable: 'GHCR_TOKEN'
        )]) {
          withCredentials([sshUserPrivateKey(
            credentialsId: 'cloud-server-ssh-key',
            keyFileVariable: 'SSH_KEY',
            usernameVariable: 'SSH_USER'
          )]) {
            sh '''
                    printf '%s' "$GHCR_TOKEN" | ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@51.107.1.67" \
                        "docker login ghcr.io --username $GHCR_USERNAME --password-stdin"

                    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@51.107.1.67" "
                      docker pull $GHCR_IMAGE:latest || exit 1;
                      docker stop auth-service || true
                      docker rm auth-service || true
                        docker run -d \\
                            --name auth-service \\
                            -p 5000:5000 \\
                            --env-file /home/azureuser/.env.auth \\
                            --restart unless-stopped \\
                            $GHCR_IMAGE:latest
                    "
                '''
          }
        }
      }
    }
  }
    post {
      success {
        echo "Pipeline succeeded! auth-service is live."
      }
      failure {
        echo "Pipeline failed. Check logs above."
      }
      always {
        sh 'docker logout ghcr.io || true'
      }
    }
}