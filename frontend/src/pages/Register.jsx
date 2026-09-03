import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { register } from "../api/auth"
import Background from "../components/Background"

const Register = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        try {
            await register(email, password)
            navigate("/login")
        } catch (error) {
            console.error(error)
            const detail = error.response?.data?.detail
            if (Array.isArray(detail)) {
                setError(detail.map(err => `${err.loc[1]}: ${err.msg}`).join(", "))
            } else {
                setError(detail || "Error registering user")
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center relative overflow-hidden text-white px-4">
            <Background />

            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-xl w-full max-w-sm relative z-10">
                <h2 className="text-3xl font-black mb-8 text-center bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Crear cuenta
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-6 text-center">
                        {error}
                    </div>
                )}

                <div className="mb-5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Email</label>
                    <input
                        type="email"
                        placeholder="tu@email.com"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-8">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Contraseña</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center">
                    Registrarse
                </button>

                <p className="mt-8 text-center text-sm text-gray-400">
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Inicia sesión
                    </Link>
                </p>
            </form>
        </div>
    )
}

export default Register