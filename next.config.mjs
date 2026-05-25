/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
        pathname: "/**"
      }
      // Add your Supabase storage host here when learner photos come from uploads, e.g.:
      // { protocol: "https", hostname: "xyz.supabase.co", pathname: "/storage/v1/object/public/**" }
    ]
  }
};

export default nextConfig;
