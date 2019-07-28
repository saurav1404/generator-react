module.exports = function () {
    var app = 'erp/app/';
    //var homeViews = 'views/home/';

    var config = {
        index: 'erp/index.html',
        appJs: app + '/',

        js: [
            app + '**/*.js',
            'erp/assets/css/**/*.css'
        ],

        bower: {
            json: require('./bower.json'),
            directory: './erp/assets/lib/',
            ignorePath: './erp',
            relative: true
        }
    };

    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    }

    return config;
};