load('ext://uibutton', 'cmd_button', 'bool_input', 'location')
load('ext://namespace', 'namespace_create', 'namespace_inject')
namespace_create('proconnect-carte-agent')

docker_build(
    'localhost:5001/proconnect-carte-agent:latest',
    context='.',
    dockerfile='./Dockerfile',
    only=['./src/app', './env.d'],
    live_update=[
        sync('./src/app', '/app'),
    ]
)

watch_file('src/helm')

k8s_yaml(local('cd src/helm && helmfile -n proconnect-carte-agent -e dev template .'))
