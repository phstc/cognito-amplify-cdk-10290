/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
};

const buildConfig = (_phase) => {
  // const plugins = [withTM];
  // const config = plugins.reduce((acc, next) => next(acc), {
  //   ...nextConfig,
  // });
  // return config;

  return nextConfig;
};

module.exports = buildConfig();
