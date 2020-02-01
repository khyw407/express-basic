node {
    podTemplate(label: 'build-application',
        containers: [
            containerTemplate(name: 'docker', image: 'docker', ttyEnabled: true, command: 'cat'),
            containerTemplate(name: 'helm', image: 'lachlanevenson/k8s-helm:latest', ttyEnabled: true, command: 'cat')
        ],
        volumes: [
            hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock')
        ]
    ) {
        node('build-application') {
            def dockerRegistry = '레지스트리 주소'
            def dockerImageName = 'sample'
            def helmChartName = 'sample'
            def git
            def commitHash

            stage('Checkout') {
                git = checkout scm
                commitHash = git.GIT_COMMIT
            }
            
            stage('Docker Image Build') {
                container('docker') {
                    sh "docker build -t ${dockerRegistry}/${dockerImageName}:${env.BUILD_NUMBER} ."
                }
            }
            
            stage('Docker Image Push') {
                container('docker'){
                    docker.withRegistry('레지스트리 주소', 'harbor-admin') {
                        sh "docker push ${dockerRegistry}/${dockerImageName}:${env.BUILD_NUMBER}"
                    }
                }
            }
            
            stage('Kubernetes Helm Deploy') {
                container('helm') {
                    sh "helm repo add chartmuseum {chartmuseum url}"
                    sh "helm repo update"
                    sh "apk add git"
                    sh "helm plugin install https://github.com/chartmuseum/helm-push"
                    sh "helm push ./deploy/helm/ --version ${env.BUILD_NUMBER} chartmuseum"
                    sh "helm repo update"
                    def helmList = sh script: "helm list --kubeconfig ${kubeConfigPath} -q --namespace default", returnStdout: true
                    if(helmList.contains("${helmChartName}")) {
                        sh "helm upgrade ${helmChartName} --kubeconfig ${kubeConfigPath} --set image.tag=${env.BRANCH_NAME}-${env.BUILD_NUMBER} --set version=${env.BUILD_NUMBER} --version ${env.BUILD_NUMBER} chartmuseum/${helmChartName}"
                    }else{
                        sh "helm install ${helmChartName} --kubeconfig ${kubeConfigPath} --set image.tag=${env.BRANCH_NAME}-${env.BUILD_NUMBER} --set version=${env.BUILD_NUMBER} --version ${env.BUILD_NUMBER} chartmuseum/${helmChartName}"
                    }
                }
            }
        }
    }
}
