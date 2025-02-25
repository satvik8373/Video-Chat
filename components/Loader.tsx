const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-900">
      <div className="relative w-64 h-4 mb-8 overflow-hidden rounded-full bg-gray-800">
        <div className="absolute inset-0 w-[200%] animate-gradient-slide">
          <div className="h-full bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#4285F4]" />
        </div>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <span className="text-3xl font-google bg-gradient-to-r from-blue-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
          MAVRIX
        </span>
        <span className="text-sm text-gray-400">is thinking...</span>
      </div>
      <style jsx>{`
        @keyframes gradient-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-gradient-slide {
          animation: gradient-slide 1.5s linear infinite;
        }
        .font-google {
          font-family: 'Google Sans', sans-serif;
          font-weight: 500;
          letter-spacing: -0.5px;
        }
      `}</style>
    </div>
  );
};

export default Loader;
