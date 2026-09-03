import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/api"
import Background from "../components/Background"

function Profile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const { logout } = useAuth()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/profile")
                setProfile(res.data)
            } catch (err) {
                console.error(err)
                if (err.response?.status === 401) {
                    navigate("/login")
                } else {
                    setError("Error loading profile")
                }
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            <p className="text-red-400 text-lg">{error}</p>
        </div>
    )

    const levelColors = {
        "A1": "from-green-400 to-emerald-500",
        "A2": "from-green-500 to-teal-500",
        "B1": "from-blue-400 to-cyan-500",
        "B2": "from-blue-500 to-indigo-500",
        "C1": "from-purple-500 to-violet-600",
        "C2": "from-amber-400 to-orange-500",
    }

    const levelGradient = levelColors[profile.level] || "from-gray-400 to-gray-500"

    const getInitials = (email) => {
        return email ? email.charAt(0).toUpperCase() : "?"
    }

    const [viewDate, setViewDate] = useState(new Date())

    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()
    const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay()
    
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const currentMonthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(viewDate)
    
    const totalDays = daysInMonth(year, month)
    const prevMonthDays = daysInMonth(year, month - 1)
    // Adjusting for Monday start
    let startOffset = firstDayOfMonth(year, month) - 1
    if (startOffset < 0) startOffset = 6

    const calendarDays = []
    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
        calendarDays.push({ day: prevMonthDays - i, current: false })
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
        const hasActivity = profile?.activity_dates?.includes(dateStr)
        calendarDays.push({ day: i, current: true, active: hasActivity, date: dateStr })
    }
    // Next month padding
    const remaining = 42 - calendarDays.length
    for (let i = 1; i <= remaining; i++) {
        calendarDays.push({ day: i, current: false })
    }

    const changeMonth = (offset) => {
        setViewDate(new Date(year, month + offset, 1))
    }

    const isToday = (d) => {
        const today = new Date()
        return d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
            <Background />

            {/* Header */}
            <div className="relative">

                <div className="relative max-w-2xl mx-auto px-6 pt-8 pb-6">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mb-6 flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium"
                    >
                        <span>←</span> Volver al Dashboard
                    </button>

                    {/* Avatar + Info */}
                    <div className="flex items-center gap-5 mb-8">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${levelGradient} flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/20`}>
                            {getInitials(profile.email)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{profile.email}</h1>
                            {profile.level ? (
                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${levelGradient} text-white shadow`}>
                                    Nivel {profile.level}
                                </span>
                            ) : (
                                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-700 text-gray-300">
                                    Sin nivel asignado
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="max-w-2xl mx-auto px-6 pb-10">

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Progress Card */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                        <p className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-1">Progreso</p>
                        <p className="text-3xl font-bold">{profile.progress_percentage}%</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {profile.completed_lessons} / {profile.total_lessons} lecciones
                        </p>
                        {/* Progress bar */}
                        <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                            <div
                                className={`bg-gradient-to-r ${levelGradient} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${profile.progress_percentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Accuracy Card */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                        <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wide mb-1">Precisión</p>
                        <p className="text-3xl font-bold">{profile.accuracy}%</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {profile.correct_answers} / {profile.total_answers} correctas
                        </p>
                        {/* Accuracy bar */}
                        <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${profile.accuracy}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Placement Score */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 mb-6">
                    <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-1">Placement Test</p>
                    {profile.placement_score !== null ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold">{profile.placement_score} pts</p>
                                <p className="text-sm text-gray-400 mt-1">Última puntuación</p>
                            </div>
                            <button
                                onClick={() => navigate("/placement")}
                                className="text-sm text-amber-300 hover:text-amber-200 border border-amber-500/30 px-4 py-2 rounded-xl hover:bg-amber-500/10 transition-all"
                            >
                                Repetir test
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <p className="text-gray-400">No has hecho el test aún</p>
                            <button
                                onClick={() => navigate("/placement")}
                                className="text-sm text-blue-300 hover:text-blue-200 border border-blue-500/30 px-4 py-2 rounded-xl hover:bg-blue-500/10 transition-all"
                            >
                                Hacer test
                            </button>
                        </div>
                    )}
                </div>

                {/* Activity Calendar */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold capitalize">{currentMonthName} {year}</h2>
                            <p className="text-xs text-gray-400">Tu constancia de aprendizaje</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                            <span key={d} className="text-[10px] font-bold text-gray-500 uppercase">{d}</span>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((dayObj, i) => (
                            <div 
                                key={i}
                                className={`
                                    aspect-square flex items-center justify-center text-sm rounded-lg relative
                                    ${dayObj.current ? 'text-white' : 'text-gray-600'}
                                    ${dayObj.current && isToday(dayObj.day) ? 'border border-blue-500/50' : ''}
                                    ${dayObj.active ? `bg-gradient-to-br ${levelGradient} shadow-lg shadow-blue-500/20 font-bold` : 'bg-white/5'}
                                `}
                            >
                                {dayObj.day}
                                {dayObj.active && (
                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded bg-gradient-to-br ${levelGradient}`}></div>
                            <span className="text-gray-400">Día activo</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-white/5 border border-white/5"></div>
                            <span className="text-gray-400">Sin actividad</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3 mb-8">
                    <button
                        onClick={() => navigate("/lesson")}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        Continuar aprendiendo
                    </button>
                    <button
                        onClick={() => navigate("/lessons")}
                        className="w-full bg-white/5 border border-white/10 text-white font-medium py-3 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        Ver todas las lecciones
                    </button>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full text-red-400 hover:text-red-300 text-sm font-medium py-3 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                >
                    Cerrar sesión
                </button>

            </div>
        </div>
    )
}

export default Profile
