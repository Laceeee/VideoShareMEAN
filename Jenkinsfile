pipeline {
    agent any

    tools {
        nodejs 'NodeJS 20'
    }

    environment {
        GITHUB_REPO = 'https://github.com/Laceeee/VideoShareMEAN.git'
        BRANCH = 'feature/devops_terraform'
        DEPLOY_CONTAINER = 'prf-project-deploy-env'
    }

    stages {
        stage('Setup Git Config') {
            steps {
                sh '''
                    git config --global http.postBuffer 1073741824
                    git config --global http.maxRequestBuffer 1073741824
                '''
            }
        }

        stage('Checkout') {
            steps {
                git branch: env.BRANCH, url: env.GITHUB_REPO
            }
        }

        stage('Install Dependencies') {
            steps {
                dir ('server') {
                    sh 'npm ci'
                }
            }
        }

        stage('Build') {
            steps {
                dir ('server') {
                    sh 'npm run build'
                }
            }
        }

        stage('Test Build') {
            steps {
                dir ('server') {
                    sh 'npm run test'
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                dir ('server') {
                    archiveArtifacts artifacts: 'build/**/*', fingerprint: true
                }
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Deploying the application...'
                sshagent(credentials: ['jenkins-deploy-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no deploy@${env.DEPLOY_CONTAINER} -p 22 '
                            git config --global http.postBuffer 1073741824
                            git config --global http.maxRequestBuffer 1073741824
                            cd /app
                            rm -rf *
                            git clone https://github.com/Laceeee/VideoShareMEAN.git
                            cd /app/VideoShareMEAN
                            git checkout feature/devops_terraform
                            mongorestore --db my_db mongodb://172.32.0.4:27017 /app/VideoShareMEAN/db_dump/my_db
                            cd /app/VideoShareMEAN/server
                            npm ci
                            npm run build
                            pm2 delete "server" || true
                            pm2 start build/index.js --name "server"
                            cd /app/VideoShareMEAN/frontend
                            npm ci
                            pm2 delete "video-app" || true
                            pm2 start "ng serve --port 4200 --host 0.0.0.0" --name "video-app"
                        '
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                deleteDir()
            }
        }
    }

    post {
        success {
            echo 'Pipeline ran successfully!'
        }
        failure {
            echo 'The pipeline execution failed!'
        }
    }
}