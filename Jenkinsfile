pipeline {
    agent any

    environment {
        GIT_REPO = 'https://github.com/Samratstackly/-stackly-hms-test.git'
        BRANCH   = 'test'

        DEPLOY_USER = 'ubuntu'
        DEPLOY_HOST = '13.59.204.169'
        DEPLOY_SSH  = 'hms-new-key'

        REMOTE_BASE = '/home/ubuntu/-stackly-hms-test'
        FRONTEND_DIR = '/home/ubuntu/-stackly-hms-test/hms_frontend'
        FASTAPI_DIR  = '/home/ubuntu/-stackly-hms-test/Fastapi_app'
        FRONTEND_BUILD = 'dist'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: "${BRANCH}", url: "${GIT_REPO}"
            }
        }

        stage('Deploy Code to EC2') {
            steps {
                sshagent(["$hms-new-key"]) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${REMOTE_BASE}"

                    rsync -avz --delete \
                    --exclude='.git' \
                    --exclude='venv' \
                    --exclude='node_modules' \
                    --exclude='__pycache__' \
                    -e "ssh -o StrictHostKeyChecking=no" \
                    ./ ${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_BASE}
                    '''
                }
            }
        }

        stage('Restart Services') {
            steps {
                sshagent(["${DEPLOY_SSH}"]) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "
                    sudo systemctl restart nginx
                    sudo systemctl restart fastapi.service
                    "
                    '''
                }
            }
        }
    }
}
