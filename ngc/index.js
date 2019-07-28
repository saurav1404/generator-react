'use strict';
var generators = require('yeoman-generator'),
    _ = require('lodash');
var beautify = require('gulp-beautify');
var filter = require('gulp-filter');
var fs = require('fs');

var beautifyFilter = filter(['**/*.js'], { restore: true });

module.exports = generators.NamedBase.extend({
    constructor: function () {
        generators.NamedBase.apply(this, arguments);
        console.log('inside ngc sub-generator', this.name);

        this.option('component', {
            desc: 'Determines if component is created properly',
            type: Boolean,
            default: false
        });
    },

    writing: function(){

        if (this.options.component) {

            this.registerTransformStream(beautifyFilter);
            this.registerTransformStream(beautify({indentSize: 2 }));
            this.registerTransformStream(beautifyFilter.restore);

            var componentName = arguments[0];

            this.fs.copyTpl(
                this.templatePath('Controller.tsx'),
                this.destinationPath('../erp/src/app/activities/' + componentName + '/' + componentName + 'Controller.tsx'),
                {
                    componentName: componentName
                }
            );

            this.fs.copyTpl(
                this.templatePath('Page.tsx'),
                this.destinationPath('../erp/src/app/activities/' + componentName + '/' + componentName + '.tsx'),
                {
                    componentName: componentName,
                    className: componentName.toLowerCase(),
                }
            );

            this.fs.copyTpl(
                this.templatePath('Page.test.tsx'),
                this.destinationPath('../erp/src/app/activities/' + componentName + '/' + componentName + '.test.tsx'),
                {
                    componentName: componentName
                }
            );

            this.fs.copyTpl(
                this.templatePath('Page.css'),
                this.destinationPath('../erp/src/app/activities/' + componentName + '/' + componentName + '.css'),
                {
                    className: componentName.toLowerCase(),
                }
            );

            this.fs.copyTpl(
                this.templatePath('Page.css.d.ts'),
                this.destinationPath('../erp/src/app/activities/' + componentName + '/' + componentName + '.css.d.ts'),
                {
                    className: componentName.toLowerCase(),
                }
            );

            this.fs.copyTpl(
                this.templatePath('index.ts'),
                this.destinationPath('../erp/src/app/activities/' + componentName + '/index.ts'),
                {
                    componentName: componentName
                }
            );

            var routeFile = this.fs.read('../erp/src/app/Routes.tsx');
            var routeHook = '// # routes here';
            var data = "\t"+componentName.toUpperCase()+" = '/"+componentName.toLowerCase()+"',";
            var routeIndex = routeFile.indexOf(routeHook);
            var indexOfData = routeFile.indexOf(data);
            if(indexOfData < 0){
                var newFile = insertInString(routeFile, data, routeIndex);
                fs.writeFileSync('../erp/src/app/Routes.tsx', newFile);
            }else{
                console.log('Route for this component already exists!')
            }

            var lazypathfile = this.fs.read('../erp/src/app/components/App/App.tsx');
            var lazypathhook = '//# lazyroute path here';
            var lazypathdata = "// tslint:disable-next-line:variable-name\n"+
                            "const "+componentName+" = React.lazy(() => import('app/activities/"+componentName+"'));";
            var lazypathindex = lazypathfile.indexOf(lazypathhook);
            var lazypathindexOfData = lazypathfile.indexOf("const "+componentName+" = React.lazy");
            if(lazypathindexOfData < 0){
                var newLazypathFile = insertInString(lazypathfile, lazypathdata, lazypathindex);
                this.fs.write('../erp/src/app/components/App/App.tsx', newLazypathFile);
            }else{
                console.log('Lazy Config for this component already exists!')
            }

            var lazyfile = this.fs.read('../erp/src/app/components/App/App.tsx');
            var lazyhook = '{/* # lazyroute here */}';
            var lazydata = "\t\t\t\t\t<LazyRoute path={Routes."+componentName.toUpperCase()+"} component={"+componentName+"} fallback={loading} exact={true} />";
            var lazyindex = lazyfile.indexOf(lazyhook);
            var lazyindexOfData = lazyfile.indexOf("path={Routes."+componentName.toUpperCase()+"}");
            if(lazyindexOfData < 0){
                var newLazyFile = insertInString(lazyfile, lazydata, lazyindex);
                this.fs.write('../erp/src/app/components/App/App.tsx', newLazyFile);
            }else{
                console.log('Lazy Config for this component already exists!')
            }

        }

        function insertInString(a, b, positionEnd){
            return [a.slice(0, positionEnd)+'\n', b+'\n', a.slice(positionEnd)+'\n'].join('');
        }

        function insertInBetweenString(a, b, positionStart, positionEnd){
            return [a.slice(0, positionStart)+'\n', b+'\n', a.slice(positionEnd)+'\n'].join('');
        }

        function capitalize(string){
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

    }
});
