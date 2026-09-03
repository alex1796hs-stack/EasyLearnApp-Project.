import { useState, useEffect } from "react"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import api from "../api/api"
import Background from "../components/Background"

function Login() {
    const { login } = useContext(AuthContext)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail")
        if (savedEmail) {
            setEmail(savedEmail)
            setRememberMe(true)
        }
    }, [])

    const handleLogin = async (e) => {

        e.preventDefault()

        setIsLoading(true)
        setError(null)

        try {

            await login(email, password)

            // Ya el token fue guardado por AuthContext.login

            // Gestión de 'Recordarme'
            if (rememberMe) {
                localStorage.setItem("rememberedEmail", email)
            } else {
                localStorage.removeItem("rememberedEmail")
            }

            // Obtener datos del dashboard para ver si hay level
            const res = await api.get("/dashboard")

            // Siempre redirigir al dashboard
            navigate("/dashboard")

        } catch (err) {

            console.error("Login error:", err)
            const detail = err.response?.data?.detail
            if (Array.isArray(detail)) {
                setError(detail.map(e => `${e.loc[1]}: ${e.msg}`).join(", "))
            } else {
                setError(detail || err.message || "Credenciales incorrectas")
            }

        } finally {
            setIsLoading(false)
        }

    }

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center relative overflow-hidden text-white px-4">

            <Background />

            <form
                onSubmit={handleLogin}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-xl w-full max-w-sm relative z-10"
            >

                <h1 className="text-3xl font-black mb-8 text-center bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    EasyLearn
                </h1>

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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                </div>

                <div className="mb-8">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Contraseña</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                </div>

                <div className="mb-8 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="peer appearance-none w-5 h-5 border border-white/20 rounded-md bg-white/5 checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer"
                            />
                            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-blue-300 transition-colors">Recordarme</span>
                    </label>
                </div>

                <button
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center disabled:opacity-75"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Conectando...
                        </>
                    ) : (
                        "Entrar"
                    )}
                </button>

                <p className="mt-8 text-center text-sm text-gray-400">
                    ¿No tienes una cuenta?{" "}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Regístrate
                    </Link>
                </p>

            </form>

        </div>

    )
}

export default Login