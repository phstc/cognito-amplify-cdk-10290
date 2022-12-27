// const withTM = require("next-transpile-modules")([
//   "@cloudscape-design/components",
// ]);

// console.log(withTM);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  transpilePackages: ["@cloudscape-design/components"],
};

// https://www.codewithyou.com/blog/cloudscape-design-with-nextjs
const buildConfig = (_phase) => {
  // const plugins = [withTM];
  // const config = plugins.reduce((acc, next) => next(acc), {
  //   ...nextConfig,
  // });
  // return config;

  return nextConfig;
};

module.exports = buildConfig();
