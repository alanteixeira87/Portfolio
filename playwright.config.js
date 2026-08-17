const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({testDir:'./tests',use:{baseURL:'http://127.0.0.1:4173'},webServer:{command:'npx --yes http-server . -p 4173 -c-1 --silent',url:'http://127.0.0.1:4173',reuseExistingServer:true}});
