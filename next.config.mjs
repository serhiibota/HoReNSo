/** @type {import('next').NextConfig} */
const nextConfig = {
  // Полностью статическое приложение: данные живут в localStorage,
  // сервер не нужен — сборку можно выложить на любой хостинг.
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
};

export default nextConfig;
