pipeline {
    agent any

    environment {

        GIT_REPO = 'https://github.com/Samratstackly/-stackly-hms-test.git'
        BRANCH   = 'test'

        DEPLOY_USER = 'ubuntu'
        DEPLOY_HOST = '13.59.204.169'
        DEPLOY_SSH  = 'ubuntu'

        REMOTE_BASE = '/home/ubuntu/-stackly-hms-test'
        FRONTEND_DIR = '/home/ubuntu/-stackly-hms-test/hms_frontend'
        FASTAPI_DIR  = '/home/ubuntu/-stackly-hms-test/Fastapi_app'
        FRONTEND_BUILD = 'dist'

        EMAIL_RECIPIENTS = 'awsdevops@thestackly.com, pavanb@thestackly.com'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: "${BRANCH}", url: "${GIT_REPO}"
            }
        }

        stage('Deploy to EC2') {
            steps {

                sshagent(credentials: ["${DEPLOY_SSH}"]) {

                    sh '''
                    echo "Creating project directory on EC2"

                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} \
                    "mkdir -p ${REMOTE_BASE}"

                    echo "Syncing project files"

                    rsync -avz \
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

        stage('Backend Setup') {
            steps {

                sshagent(credentials: ["${DEPLOY_SSH}"]) {

                    sh '''
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << EOF

                    set -e
                    cd ${REMOTE_BASE}

                    echo "Setting up Python environment"

                    python3 -m venv venv
                    source venv/bin/activate

                    pip install --upgrade pip
                    pip install -r requirement.txt

                    echo "Running Django migrations"

                    python manage.py makemigrations
                    python manage.py migrate

                    EOF
                    '''
                }
            }
        }

        stage('Deploy Frontend') {
            steps {

                sshagent(credentials: ["${DEPLOY_SSH}"]) {

                    sh '''
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << EOF

                    set -e

                    echo "Deploying frontend"

                    cd ${FRONTEND_DIR}

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

                sshagent(credentials: ["${DEPLOY_SSH}"]) {

                    sh '''
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << EOF

                    echo "Restarting services"

                    sudo systemctl daemon-reload
                    sudo systemctl restart nginx
                    sudo systemctl restart fastapi.service

                    echo "Deployment completed"

                    EOF
                    '''
                }
            }
        }
    }

    post {

        success {
            emailext(
                subject: "HMS Deployment SUCCESS - ${DEPLOY_HOST}",
                to: "${EMAIL_RECIPIENTS}",
                body: """
Deployment Successful

Server: ${DEPLOY_HOST}
Branch: ${BRANCH}

Services restarted successfully.

Time: ${new Date()}
"""
            )
        }

        failure {
            emailext(
                subject: "HMS Deployment FAILED - ${DEPLOY_HOST}",
                to: "${EMAIL_RECIPIENTS}",
                body: """
Deployment Failed

Server: ${DEPLOY_HOST}
Branch: ${BRANCH}

Check Jenkins console logs.

Time: ${new Date()}
"""
            )
        }
    }
}
