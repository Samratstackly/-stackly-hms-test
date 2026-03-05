pipeline {
    agent any

    environment {
        GIT_REPO = 'https://github.com/Samratstackly/-stackly-hms-test.git'
        BRANCH = 'test'
        DEPLOY_USER = 'ubuntu'
        DEPLOY_HOST = '13.59.204.169'
        DEPLOY_SSH = 'hms-test-automation-key'

        REMOTE_BASE = '/home/ubuntu/-stackly-hms-test'
        FRONTEND_DIR = "${REMOTE_BASE}/hms_frontend"
        FASTAPI_DIR = "${REMOTE_BASE}/Fastapi_app"
        FRONTEND_BUILD = 'dist'

        DB_NAME = 'hms_db'
        DB_USER = 'hms_user'
        DB_PASSWORD = 'Hms@2026_Test!'
        DB_HOST = 'localhost'
        DB_PORT = '3306'

        EMAIL_RECIPIENTS = 'awsdevops@thestackly.com, pavanb@thestackly.com, uday@thestackly.com, prakashraj@thestackly.com, thummalajayanth@thestackly.com, guntur@thestackly.com, yarramallamaheshbabu@thestackly.com, nndinesh@thestackly.com, muruganps@thestackly.com'
    }

    stages {

        /* ========== 1️⃣ CHECKOUT CODE ========== */
        stage('Checkout Code') {
            steps {
                git branch: "${BRANCH}", url: "${GIT_REPO}"
            }
        }

        /* ========== 2️⃣ INSTALL DEPENDENCIES ========== */
        stage('Install Dependencies') {
            steps {
                sh '''
                python3 -m venv venv
                source venv/bin/activate
                pip install --upgrade pip
                pip install -r requirement.txt
                '''
            }
        }

        /* ========== 3️⃣ RUN MIGRATIONS ========== */
        stage('Run Django Migrations') {
            steps {
                sh '''
                source venv/bin/activate
                python manage.py makemigrations
                python manage.py migrate
                '''
            }
        }

        /* ========== 4️⃣ DEPLOY TO EC2 ========== */
        stage('Deploy to EC2') {
            steps {
                sshagent (credentials: ["${DEPLOY_SSH}"]) {
                    sh """
                    echo "🚀 Syncing project files to EC2..."

                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'mkdir -p ${REMOTE_BASE}'

                    rsync -az \
                      --exclude='.git' \
                      --exclude='venv' \
                      --exclude='__pycache__' \
                      --exclude='node_modules' \
                      --rsh='ssh -o StrictHostKeyChecking=no' \
                      ./ ${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_BASE}/

                    echo "⚙️ Running backend setup..."

                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << ENDSSH
                    set -e
                    cd ${REMOTE_BASE}

                    python3 -m venv .venv
                    source .venv/bin/activate

                    pip install --upgrade pip setuptools wheel
                    pip install -r requirement.txt

                    python manage.py makemigrations
                    python manage.py migrate
ENDSSH
                    """
                }
            }
        }

        /* ========== 5️⃣ RESTART SERVICES ========== */
        stage('Restart Services') {
            steps {
                sshagent (credentials: ["${DEPLOY_SSH}"]) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << ENDSSH
                    set -e

                    echo "Deploying Frontend..."
                    cd ${FRONTEND_DIR}

                    sudo rm -rf /var/www/html/*
                    sudo cp -r ${FRONTEND_DIR}/${FRONTEND_BUILD}/* /var/www/html/

                    sudo chown -R www-data:www-data /var/www/html/

                    echo "Restarting Services..."

                    sudo systemctl daemon-reload
                    sudo nginx -t
                    sudo systemctl restart nginx
                    sudo systemctl restart fastapi.service || true

                    echo "✅ Deployment Completed"
ENDSSH
                    """
                }
            }
        }
    }

    post {

        success {
            emailext(
                subject: "✅ HMS Deployment SUCCESS on ${DEPLOY_HOST}",
                to: "${EMAIL_RECIPIENTS}",
                body: """
<h2>Deployment Successful 🎉</h2>
<p><b>Server:</b> ${DEPLOY_HOST}</p>
<p><b>Branch:</b> ${BRANCH}</p>
<p><b>Database:</b> ${DB_NAME} @ ${DB_HOST}</p>
<p>NGINX and backend services restarted successfully.</p>
<p>Timestamp: ${new Date()}</p>
"""
            )
        }

        failure {
            emailext(
                subject: "❌ HMS Deployment FAILED on ${DEPLOY_HOST}",
                to: "${EMAIL_RECIPIENTS}",
                body: """
<h2>Deployment Failed 🚨</h2>
<p><b>Server:</b> ${DEPLOY_HOST}</p>
<p><b>Branch:</b> ${BRANCH}</p>
<p>Check Jenkins console logs for errors.</p>
<p>Timestamp: ${new Date()}</p>
"""
            )
        }
    }
}
