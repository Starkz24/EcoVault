module.exports = {
    apps: [
        {
            name: "client",
            cwd: "./client",        
            script: "npm",            
            args: "start",            
            watch: true,
            instances: 1,             
            exec_mode: "fork",       
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        },
        {
            name: "server",
            cwd: "./server",        
            script: "npx",          
            args: "nodemon index.js",
            watch: true,
            instances: 1,           
            exec_mode: "fork",        
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        },
        {
            name: "model",
            cwd: "./model",           
            script: "python3",        
            args: "app.py",          
            watch: true,
            instances: 1,             
            exec_mode: "fork",      
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        }
    ]
}
