/** @type {import('next').NextConfig} */
const path = require("path");
const nextConfig = {
   webpack: (config) => {
      // GLSLファイル用のルールを追加
      config.module.rules.push({
         test: /\.(glsl|vs|fs|vert|frag)$/,
         exclude: /node_modules/,
         use: ["raw-loader", "glslify-loader"],
      });

      // project rootのthreeを参照するように設定
      config.resolve.alias = {
         ...config.resolve.alias,
         three: path.resolve(__dirname, "node_modules/three"),
      };

      return config;
   },
};

module.exports = nextConfig;
