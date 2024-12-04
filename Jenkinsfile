pipeline {
    agent any

    tools {
        nodejs 'NodeJS 20'  // Feltételezve, hogy van egy "NodeJS 20" nevű NodeJS telepítés konfigurálva Jenkinsben
    }

    environment {
        GITHUB_REPO = 'https://github.com/jankiz/nodejs-sample-app-for-devops.git'
        BRANCH = 'feature/http-server'
        DEPLOY_CONTAINER = 'node20-deploy-container'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: env.BRANCH, url: env.GITHUB_REPO
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'  // Használjuk az 'npm ci'-t az 'npm install' helyett a konzisztens telepítés érdekében
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test Source') {
            steps {
                sh 'npm run test:src'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test Distribution') {
            steps {
                sh 'npm run test:dist'
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch env.BRANCH
                }
            }
            steps {
                echo 'Deploying the application...'
                sshagent(credentials: ['jenkins-deploy-key']) { // sshagent plugin szükséges
                    sh """
                        ssh -o StrictHostKeyChecking=no deploy@${env.DEPLOY_CONTAINER} -p 22 '
                            cd /app
                            rm -rf *
                            git clone https://github.com/jankiz/nodejs-sample-app-for-devops.git
                            cd /app/nodejs-sample-app-for-devops
                            git checkout origin/feature/http-server
                            npm ci
                            npm run build
                            pm2 start dist/index.js --name "calculator-app"
                        '
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                // Munkaterület tisztítása
                deleteDir()
            }
        }
    }

    post {
        success {
            echo 'Pipeline sikeresen lefutott!'
        }
        failure {
            echo 'A pipeline végrehajtása sikertelen volt.'
            // Itt értesítést küldhetnénk, például e-mailt vagy Slack üzenetet
        }
    }
}