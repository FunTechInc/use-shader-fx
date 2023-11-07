/** @type {import('next').NextConfig} */
const nextConfig = {
   webpack: (config, { isServer }) => {
      // GLSLファイル用のルールを追加
      config.module.rules.push({
         test: /\.(glsl|vs|fs|vert|frag)$/,
         exclude: /node_modules/,
         use: ["raw-loader", "glslify-loader"],
      });
      return config;
   },
};

module.exports = nextConfig;
