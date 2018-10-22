////
// @TODO
////

// http://eslint.org/docs/user-guide/configuring

module.exports = {
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        browser: true,
        node: true,
        mocha: true
    },
    rules: {
        'prefer-arrow-callback': 'off', //mocha recommends "function" callbacks
    },
    extends: '../.eslintrc.js'
};
