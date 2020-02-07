node {
    podTemplate(label: 'build-application',
        containers: [
            containerTemplate(name: 'docker', image: 'docker', ttyEnabled: true, command: 'cat'),
            containerTemplate(name: 'helm', image: 'lachlanevenson/k8s-helm:latest', ttyEnabled: true, command: 'cat')
        ],
        volumes: [
            hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock'),
            hostPathVolume(hostPath: '/home/service/.kube', mountPath: '/home/service/.kube')
        ],
        imagePullSecrets: [
            '이미지pull시 사용하는 secret'
        ]
    ) {
        node('build-application') {
            def dockerRegistry = '레지스트리 주소'
            def kubeConfigPath = '/home/service/.kube/config'
            def git
            def commitHash
            def gitRepoName
            def dockerImageName
            def helmChartName
            def ingressHost

            stage('Checkout') {
                git = checkout scm
                commitHash = git.GIT_COMMIT
                gitRepoName = git.GIT_URL.tokenize("/")[3].replaceAll(".git", "")
                dockerImageName = "${gitRepoName}-${env.BRANCH_NAME.replaceAll('/', '-')}"
                helmChartName = "${gitRepoName}-${env.BRANCH_NAME.replaceAll('/', '-')}"
                ingressHost = "${gitRepoName}.${env.BRANCH_NAME.replaceAll('/', '.')}.{ip주소}.xip.io"
            }
            
            stage('Docker Image Build') {
                container('docker') {
                    sh "docker build -t ${dockerRegistry}/${dockerImageName}:${env.BRANCH_NAME.replaceAll('/', '-')}-${env.BUILD_NUMBER} ."
                }
            }
            
            stage('Docker Image Push') {
                container('docker'){
                    docker.withRegistry('레지스트리 주소', 'harbor-admin') {
                        sh "docker push ${dockerRegistry}/${dockerImageName}:${env.BRANCH_NAME.replaceAll('/', '-')}-${env.BUILD_NUMBER}"
                    }
                }
            }
            
            stage('Remove Build Docker Image') {
                container('docker') {
                    sh "docker rmi ${dockerRegistry}/${dockerImageName}:${env.BRANCH_NAME.replaceAll('/', '-')}-${env.BUILD_NUMBER}"
                }
            }
            
            stage('Kubernetes Helm Deploy') {
                container('helm') {
                    try{
                        sh "helm repo add chartmuseum http://chartmuseum-chartmuseum.chartmuseum.10.52.181.241.xip.io/"
                        sh "helm repo update"
                        sh "apk add git"
                        sh "helm plugin install https://github.com/chartmuseum/helm-push"
                        sh "sed -i 's/project_name#branch_name/${helmChartName}/g' ./deploy/helm/Chart.yaml"
                        sh "helm push ./deploy/helm/ --version ${env.BUILD_NUMBER} chartmuseum"
                        sh "helm repo update"
                    } catch (e) {
                        error("Error occured in the helm container");
                    }

                    def helmList = sh script: "helm list --kubeconfig ${kubeConfigPath} -q --namespace default", returnStdout: true
                    
                    if(helmList.contains("${helmChartName}")) {
                        echo "Already installed. Upgrade from helm repository!"
                        sh "helm upgrade ${helmChartName} --kubeconfig ${kubeConfigPath} --set name=${helmChartName},configmap.name=configmap-${helmChartName},deployment.name=deployment-${helmChartName},service.name=service-${helmChartName},ingress.name=ingress-${helmChartName},ingress.host=${ingressHost},image.tag=${env.BRANCH_NAME.replaceAll('/', '-')}-${env.BUILD_NUMBER},version=${env.BUILD_NUMBER} --version ${env.BUILD_NUMBER} chartmuseum/${helmChartName}"
                    }else{
                        echo "Install from helm repository!"
                        sh "helm install ${helmChartName} --kubeconfig ${kubeConfigPath} --set name=${helmChartName},configmap.name=configmap-${helmChartName},deployment.name=deployment-${helmChartName},service.name=service-${helmChartName},ingress.name=ingress-${helmChartName},ingress.host=${ingressHost},image.tag=${env.BRANCH_NAME.replaceAll('/', '-')}-${env.BUILD_NUMBER},version=${env.BUILD_NUMBER} --version ${env.BUILD_NUMBER} chartmuseum/${helmChartName}"
                    }
                }
            }
            
            stage('Clean Up Environment') {
                container('docker') {
                    sh "docker system prune -f -a"
                }
            }
        }
    }
}
