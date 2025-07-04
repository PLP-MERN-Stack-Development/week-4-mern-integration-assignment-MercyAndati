import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-950">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 dark:bg-gray-950">
        <Outlet /> {/* This is where child routes will render */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;