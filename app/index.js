'use strict';
var util = require('util');
var generators = require('yeoman-generator'),
    _ = require('lodash'),
    chalk = require('chalk'),
    yosay = require('yosay');

module.exports = generators.Base.extend({
    constructor: function(){
        generators.Base.apply(this, arguments);
        this.argument('reactappname', { type: String, required: true });
        this.appname = _.kebabCase(this.appname);
        this.option('includeutils', {
           desc: 'Optionally includes Antd Utils library.',
           type: Boolean,
           default: false 
        });
    },
    initializing: function(){
    },
    prompting: function(){
        this.log(yosay('Welcome to ' + 
            chalk.yellow('ERP') + ' generator!'));
            var done = this.async();
            this.prompt([{
                type: 'input',
                name: 'reactappname',
                message: 'React App Name (default: app)',
                default: 'app',
                default: this.config.get('reactappname') || 'app'
            },
            {
                type: 'checkbox',
                name: 'jslibs',
                message: 'Which JS libraries would you like to include?',
                choices: [
                    {
                        name: 'lodash',
                        value: 'lodash',
                        checked: true
                    },
                    {
                        name: 'Moment.js',
                        value: 'momentjs',
                        checked: true
                    },
                    {
                        name: 'antd',
                        value: 'antd',
                        checked: true
                    }
                ]
            }], function(answers){
               this.log(answers);
               this.config.set('reactappname', answers.reactappname);
               this.config.save();
               
               this.includeLodash = _.includes(answers.jslibs, 'lodash');
               this.includeMoment = _.includes(answers.jslibs, 'momentjs');
               this.includeAntd = _.includes(answers.jslibs, 'antd');               
               done(); 
            }.bind(this));
            
    },
    configuring: function(){
    },
    writing: {
        packageJSON: function(){
            this.copy('_package.json', '../erp/package.json');
        },

        git: function(){
            this.copy('gitignore', '../erp/.gitignore');
        },
        appStaticFiles: function(){
            this.copy('_tsconfig.json', '../erp/tsconfig.json');
            this.copy('_tslint.json', '../erp/tslint.json');
            this.copy('_README.MD', '../erp/README.MD');
            this.copy('.editorconfig', '../erp/.editorconfig');

            this.directory('config', '../erp/config');
            this.directory('test', '../erp/test');
            this.directory('src/assets', '../erp/src/assets');
            this.directory('src/app', '../erp/src/app');
        },

        scripts: function(){
            this.fs.copyTpl(
                this.templatePath('src/app/index.tsx'),
                this.destinationPath('../erp/src/app/index.tsx'),
                {
                    reactappname: this.config.get('reactappname')
                }
            );
        },

        html: function(){
            this.fs.copyTpl(
                this.templatePath('public/index.html'),
                this.destinationPath('../erp/public/index.html'),
                {
                    appname: _.startCase(this.reactappname),
                    reactappname: this.config.get('reactappname')
                }
            );
        }
    },
    conflicts: function(){
    },
    install: function(){
        var npmdir = process.cwd() + '/../erp';
        process.chdir(npmdir);
       // this.yarnInstall([], { 'dev': true });
        this.npmInstall();
        // this.installDependencies({
        //     yarn: {force: true},
        //     npm: false,
        //     bower: false
        // });
    },
    end: function(){
        this.log(chalk.yellow.bold('Installation successful!'));

        var howToInstall =
            '\nAfter running ' + chalk.yellow.bold('npm install') +
            ', inject your front end dependencies by running ' +
            chalk.yellow.bold('gulp wiredep') +
            '.';

        if (this.options['skip-install']) {
            this.log(howToInstall);
            return;
        }
    }
});