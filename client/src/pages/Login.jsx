import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const API_URL = '/api/auth/login';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Iniciando sesión...');

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Bienvenido, ${data.name}`, { id: loadingToast });
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/');
            } else {
                toast.error(data.message || 'Error al iniciar sesión', { id: loadingToast });
            }
        } catch (err) {
            toast.error('Error de conexión con el servidor', { id: loadingToast });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-rose-100 relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">ServiDesk</h1>
                    <p className="text-gray-500 font-medium">Sistema Corporativo</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider pl-1">Email Corporativo</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            placeholder="ejemplo@empresa.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider pl-1">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3.5 px-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                    >
                        Acceder al Sistema
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200/50 text-center">
                    <p className="text-xs text-gray-400">
                        ¿Olvidaste tus credenciales? <a href="#" className="text-blue-600 hover:underline">Contactar IT</a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;
