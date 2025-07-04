const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 dark:bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">MERN Blog</h3>
            <p className="text-gray-400">A full-stack blog application</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-gray-300">About</a>
            <a href="#" className="hover:text-gray-300">Contact</a>
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms</a>
          </div>
        </div>
        <div className="mt-6 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} MERN Blog. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;