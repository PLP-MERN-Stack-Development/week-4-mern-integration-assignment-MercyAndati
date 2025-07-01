import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Layout from'./components/Layout';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CategoriesPages from './pages/CategoriesPage';
import {AuthProvider} from './context/AuthContext';

function App(){
    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<HomePage/>} />
                        <Route path="/posts/:id" element={<PostPage/>} />
                        <Route path="/create-post" element={<CreatePostPage/>} />
                        <Route path="/edit-post/:id" element={<EditPostPage/>} />
                        <Route path="/login" element={<LoginPage/>} />
                        <Route path="/register" element={<RegisterPage/>} />
                        <Route path="/categories" element={<CategoriesPages/>} />
                    </Routes>
                </Layout>
                <ToastContainer position="bottom-right"/>
            </Router>
        </AuthProvider>
    )
}

export default App;