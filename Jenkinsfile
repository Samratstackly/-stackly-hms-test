pipeline {
agent any

```
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

    EMAIL_RECIPIENTS = 'awsdevops@thestackly.com,pavanb@thestackly.com'
}

stages {

    stage('Checkout Code') {
        steps {
            git branch: "${BRANCH}", url: "${GIT_REPO}"
        }
    }

    stage('Deploy Code to EC2') {
        steps {
            sshagent(["${DEPLOY_SSH}"]) {
                sh '''
                echo "Creating project directory on EC2"

                ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${REMOTE_BASE}"

                echo "Copying project files"

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

    stage('Setup Backend') {
        steps {
            sshagent(["${DEPLOY_SSH}"]) {
                sh '''
                ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << EOF

                set -e

                cd ${FASTAPI_DIR}

                echo "Creating Python virtual environment"
                python3 -m venv venv

                source venv/bin/activate

                echo "Installing Python dependencies"
                pip install --upgrade pip
                pip install -r requirement.txt

                EOF
                '''
            }
        }
    }

    stage('Deploy Frontend') {
        steps {
            sshagent(["${DEPLOY_SSH}"]) {
                sh '''
                ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << EOF

                set -e

                cd ${FRONTEND_DIR}

                echo "Deploying frontend to nginx"

                sudo rm -rf /var/www/html/*
                sudo cp -r ${FRONTEND_BUILD}/* /var/www/html/

                sudo chown -R www-data:www-data /var/www/html/

                EOF
                '''
            }
        }
    }

    stage('Restart Services') {
        steps {
            sshagent(["${DEPLOY_SSH}"]) {
                sh '''
                ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << EOF
```
