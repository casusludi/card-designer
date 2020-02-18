const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

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
    },
    plugins: [
        new CopyPlugin([
            { from: './public', to: '../renderer' }
        ]),
    ],
}