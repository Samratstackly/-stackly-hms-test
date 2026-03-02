pipeline {
    agent none
 
    environment {
        GIT_REPO = 'https://github.com/thestackly/stackly-hms.git'
        BRANCH = 'test'
        DEPLOY_USER = 'ubuntu'
        DEPLOY_HOST = '13.59.204.169'
        DEPLOY_SSH = 'hms-test-automation-key'
 
        REMOTE_BASE = '/home/ubuntu/stackly-hms'
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
 
        /* ========== 1️⃣ CHECKOUT CODE  ========== */
        stage('Checkout Code') {
            agent { label 'hms-test' }
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${BRANCH}"]],
                    userRemoteConfigs: [[url: "${GIT_REPO}", credentialsId: 'StacklyHMSTest']]
                ])
            }
        }
 
        /* ========== 2️⃣  BUILD FRONTEND (Improved) ========== */
        stage('Build Frontend') {
          agent { label 'hms-test' }
          environment {
            VITE_API_BASE_URL = 'http://13.59.204.169:8000'
          }
          steps {
            dir('hms_frontend') {
              sh '''
                set -e
                echo "Building frontend with API base: $VITE_API_BASE"
                npm ci --no-audit --no-fund || npm install
                npm run build -- --mode production
              '''
       }
  }
}

 
        /* ========== 3️⃣ DEPLOY TO EC2 ========== */
        stage('Deploy & Migrate') {
            agent { label 'hms-test' }
            steps {
                sshagent (credentials: ["${DEPLOY_SSH}"]) {
                    sh """
                        echo "🚀 Syncing project files to EC2..."
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'mkdir -p ${REMOTE_BASE}'
                        rsync -az \
                          --exclude='**/.venv' \
                          --exclude='**/__pycache__' \
                          --exclude='node_modules' \
                          --exclude='staticfiles' \
                          --rsh='ssh -o StrictHostKeyChecking=no' \
                          ./ ${DEPLOY_USER}@${DEPLOY_HOST}:${REMOTE_BASE}/
 
                        echo "⚙️ Running backend setup & migrations..."
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} <<'ENDSSH'
                        set -e
                        cd ${REMOTE_BASE}
 
                        echo "🐍 Creating virtual environment..."
                        python3 -m venv .venv
 
                        echo "📦 Installing dependencies inside venv..."
                        source .venv/bin/activate
                        pip install --upgrade pip setuptools wheel
                        pip install -r requirement.txt
 
                        echo "🚀 Applying Django migrations..."
                        python manage.py makemigrations 
                        python manage.py migrate 
 
                        
ENDSSH
                    """
                }
            }
        }
 
        /* ========== 4️⃣ RESTART SERVICES ========== */
        stage('Restart Services') {
            agent { label 'hms-test' }
            steps {
                sshagent (credentials: ["${DEPLOY_SSH}"]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} <<ENDSSH
                        set -e
 
                        echo "[1/3] Deploying Frontend..."
                        cd ${FRONTEND_DIR}
                        sudo rm -rf /var/www/html/*
                        sudo cp -r ${FRONTEND_DIR}/${FRONTEND_BUILD}/* /var/www/html/
                        sudo chown -R www-data:www-data /var/www/html/
 
                        echo "🔁 Restarting backend services..."
                        sudo systemctl daemon-reload
                        sudo nginx -t
                        sudo systemctl restart nginx
                        sudo systemctl restart fastapi.service || true
 
                        echo "✅ Deployment Complete — FastAPI (8000) + NGINX (443)"
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
<p>✅ NGINX  + FastAPI restarted successfully.</p>
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
<p>❌ Check Jenkins console logs for full stack trace.</p>
<p>Timestamp: ${new Date()}</p>
                """
            )
        }
    }
}