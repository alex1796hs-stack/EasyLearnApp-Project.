import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/api"
import Background from "../components/Background"

function Lessons() {

    const [lessons, setLessons] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {

        const fetchLessons = async () => {
            try {
                const res = await api.get("/lessons")
                setLessons(res.data)
            } catch (err) {
                console.error(err)
                setError("Error loading lessons")
            } finally {
                setLoading(false)
            }
        }

        fetchLessons()

    }, [])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
            <p className="text-red-400 p-6">{error}</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
            <Background />

            <div className="max-w-4xl mx-auto px-6 pt-8 pb-10 relative z-10">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mb-6 flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium"
                >
                    <span>←</span> Volver al Dashboard
                </button>

                <h1 className="text-3xl font-black mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Todas las Lecciones
                </h1>

                <div className="grid gap-4 md:grid-cols-2">
                    {lessons.map((lesson) => (
                        <div
                            key={lesson.id}
                            onClick={() => navigate("/lesson")}
                            className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-white/10 cursor-pointer transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h2 className="text-lg font-bold text-white line-clamp-2 pr-4">
                                        {lesson.title}
                                    </h2>
                                    <span className="shrink-0 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full capitalize font-semibold tracking-wide">
                                        {lesson.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Lessons