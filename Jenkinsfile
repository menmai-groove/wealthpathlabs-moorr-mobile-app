pipeline {
  environment {
    // APPCENTER_TOKEN = credentials('jenkins-codepush-token')
    // APP = credentials('jenkins-codepush-app')
    // DEPLOYMENT = 'Staging'
    // DISTRIBUTION_RATE = 100
    FASTLANE_SESSION=credentials('fastlane-session')
    FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD=credentials('fastlane-apple-application-specific-password')
    DROPIFY_IP = credentials('dropify-ip')
    DROPIFY_HOME = '/Users/dropify'
    DROPIFY_PASSWORD = credentials('dropify-password');
    APP_FOLDER_NAME = credentials('app-folder-name');
  }
  agent any
  stages {
    stage ("Test") {
      agent {
        docker {
          image 'node:10-alpine'
        }
      }
      environment {
        HOME = '.'
      }
      options {
        timeout(time: 10, unit: 'MINUTES')
      }
      steps {
        checkout scm
        echo 'Testing React native project'
        sh 'npm i'
        sh 'npm run lint-test'
        sh 'npm run test'
      }
    }
    stage ("Release Application") {
      when {
        branch pattern: "release/[0-9]+.[0-9]+.[0-9]+", comparator: "REGEXP"
        // example: release/1.0.0, release/1.0.0-alpha, release/1.0.0-a2342das (commit short id)
      }
      steps {
        script {
          def remote = [:]
          remote.name = 'Dropify'
          remote.host = env.DROPIFY_IP
          remote.user = 'dropify'
          remote.password = env.DROPIFY_PASSWORD
          remote.allowAnyHosts = true
          stage('Remote SSH') {
            // sshCommand remote: remote, command: """export FASTLANE_SESSION=${env.FASTLANE_SESSION}"""
            sshCommand remote: remote, command: "BUILD_ENVIRONMENT=Jenkin DROPIFY_PASSWORD=${env.DROPIFY_PASSWORD} FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD=${env.FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD} GIT_BRANCH=${env.GIT_BRANCH} bash ${DROPIFY_HOME}/Workspaces/DeploymentScripts/${env.APP_FOLDER_NAME}/ci.sh"
          }
        }
      }
    }
    // stage ("Release react") {
    //   when {
    //     branch pattern: "release/v-[a-zA-Z0-9]+", comparator: "REGEXP"
    //   }
    //   steps {
    //     checkout scm
    //     sh 'cp .sample.env .env'
    //     sh 'which docker'
    //     sh 'docker build -t groovetech/groove_codepush_react .'
    //     sh "docker run -e APPCENTER_TOKEN=${env.APPCENTER_TOKEN} -e APP=${env.APP} -e DEPLOYMENT=${env.DEPLOYMENT} -e DISTRIBUTION_RATE=${env.DISTRIBUTION_RATE} dungtran/groove_codepush_react"
    //   }
    // }
  }
}