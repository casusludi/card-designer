const webpack = require('webpack');

module.exports = {
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /(node_modules)/,
                options: {
                    plugins: [
                        ['transform-react-jsx', { pragma: 'jsxFactory.createElement' }],
                    ]
                }
            }
        ]
    }
}