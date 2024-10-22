module.exports = {
    apps: [
        {
            name: 'g1:3001',
            port: '3001',
            exec_mode: 'cluster',
            instances: 'max',
            script: './.output/server/index.mjs'
        }
    ]
}
