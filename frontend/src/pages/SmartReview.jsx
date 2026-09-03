import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/api"
import Background from "../components/Background"

function SmartReview() {

    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [noWeakQuestions, setNoWeakQuestions] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selected, setSelected] = useState(null)
    const [showAnswer, setShowAnswer] = useState(false)
    const [finished, setFinished] = useState(false)
    const [score, setScore] = useState(0)
    const [audioState, setAudioState] = useState({ state: 'idle', currentText: null })
    const navigate = useNavigate()

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const res = await api.get("/review/questions")
                if (res.data.message === "no_weak_questions") {
                    setNoWeakQuestions(true)
                } else {
                    setQuestions(res.data.questions)
                }
            } catch (err) {
                console.error(err)
                setError("No se pudieron cargar las preguntas de repaso.")
            } finally {
                setLoading(false)
            }
        }

        fetchReview()

        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel()
        }
    }, [])

    const toggleAudio = (text) => {
        if (!('speechSynthesis' in window)) return

        const synth = window.speechSynthesis

        if (audioState.currentText === text) {
            if (audioState.state === 'playing') {
                synth.pause()
                setAudioState({ currentText: text, state: 'paused' })
            } else if (audioState.state === 'paused') {
                synth.resume()
                setAudioState({ currentText: text, state: 'playing' })
            }
        } else {
            synth.cancel()
            const cleanText = text.replace(/_{2,}/g, "blank")
            const utterance = new SpeechSynthesisUtterance(cleanText)
            utterance.lang = 'en-US'
            utterance.onend = () => setAudioState({ state: 'idle', currentText: null })
            utterance.onerror = () => setAudioState({ state: 'idle', currentText: null })
            synth.speak(utterance)
            setAudioState({ currentText: text, state: 'playing' })
        }
    }

    const handleAnswer = async (option) => {
        setSelected(option)
        setShowAnswer(true)
        const question = questions[currentQuestion]
        const isCorrect = option === question.correct
        if (isCorrect) setScore(prev => prev + 1)

        try {
            await api.post("/answers", {
                question_id: question.id,
                is_correct: isCorrect
            })
        } catch (err) {
            console.error("Error saving answer:", err)
        }
    }

    const nextQuestion = () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel()
        setAudioState({ state: 'idle', currentText: null })

        if (currentQuestion + 1 >= questions.length) {
            setFinished(true)
            return
        }
        setCurrentQuestion(prev => prev + 1)
        setSelected(null)
        setShowAnswer(false)
    }

    // --- Loading state ---
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    // --- Error state ---
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
            <div className="text-center p-8 bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-2xl max-w-sm">
                <p className="text-red-400 font-bold mb-4">{error}</p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-all border border-white/10"
                >
                    Volver al Dashboard
                </button>
            </div>
        </div>
    )

    // --- No weak questions (user is doing great!) ---
    if (noWeakQuestions) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
            <Background variant="warm" />
            <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-xl text-center relative z-10">
                <p className="text-6xl mb-6">🏆</p>
                <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    ¡Perfecto historial!
                </h1>
                <p className="text-gray-300 mb-8 leading-relaxed">
                    No tienes preguntas pendientes de reforzar. ¡Estás dominando todo el contenido! Sigue completando lecciones para que el repaso inteligente pueda analizar tus puntos débiles.
                </p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
                >
                    ← Volver al Dashboard
                </button>
            </div>
        </div>
    )

    // --- Finished state ---
    if (finished) {
        const percentage = Math.round((score / questions.length) * 100)
        const isGood = percentage >= 70
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
                <Background variant="warm" />
                <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-xl text-center relative z-10">
                    <p className="text-5xl mb-4">{isGood ? "🎉" : "💪"}</p>
                    <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                        Repaso completado
                    </h1>
                    <p className="text-gray-400 mb-6">{isGood ? "¡Buen trabajo! Estás mejorando." : "Sigue practicando, ¡tú puedes!"}</p>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-8">
                        <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Puntuación Final</p>
                        <p className={`text-3xl font-bold mb-2 ${isGood ? 'text-emerald-400' : 'text-amber-400'}`}>{percentage}%</p>
                        <p className="text-sm text-gray-400">{score}/{questions.length} correctas</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setFinished(false); setCurrentQuestion(0); setScore(0); setSelected(null); setShowAnswer(false); }}
                            className="flex-1 bg-white/5 border border-white/10 text-white font-semibold py-3.5 rounded-xl hover:bg-white/10 transition-all"
                        >
                            🔄 Repetir
                        </button>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                            Dashboard →
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const question = questions[currentQuestion]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
            <Background variant="warm" />

            <div className="max-w-2xl mx-auto px-6 pt-8 pb-10 relative z-10">

                {/* Header */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mb-6 flex items-center gap-2 text-amber-300 hover:text-white transition-colors text-sm font-medium"
                >
                    <span>←</span> Salir del repaso
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🧠</span>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                        Repaso Inteligente
                    </h1>
                </div>
                <p className="text-gray-400 text-sm mb-8">Preguntas donde necesitas refuerzo</p>

                {/* Progress bar */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">Pregunta {currentQuestion + 1} de {questions.length}</span>
                    <span className="text-xs text-amber-400 font-bold">{Math.round((currentQuestion / questions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mb-8">
                    <div
                        className="bg-gradient-to-r from-amber-400 to-yellow-400 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                    ></div>
                </div>

                {/* Topic / difficulty tag */}
                <div className="flex gap-2 mb-4">
                    {question.topic && (
                        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold">
                            {question.topic}
                        </span>
                    )}
                    {question.difficulty && (
                        <span className="bg-white/5 border border-white/10 text-gray-400 text-xs px-3 py-1 rounded-full font-semibold capitalize">
                            {question.difficulty}
                        </span>
                    )}
                </div>

                {/* Question card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 shadow-xl mb-6">
                    <div className="flex items-start justify-between gap-4 mb-8">
                        <p className="text-xl font-medium leading-relaxed">
                            {question.question}
                        </p>
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleAudio(question.question) }}
                            className="shrink-0 p-2.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-colors rounded-full border border-amber-500/20"
                            title={audioState.currentText === question.question && audioState.state === 'playing' ? "Pausar" : "Escuchar"}
                        >
                            {audioState.currentText === question.question && audioState.state === 'playing' ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M17.657 6.343a8 8 0 010 11.314M11 5L6 9H2v6h4l5 4V5z"></path>
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {question.options.map((opt, i) => {
                            const isCorrectAnswer = showAnswer && opt === question.correct
                            const isWrongSelected = showAnswer && opt === selected && opt !== question.correct

                            let btnStyles = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/50"
                            if (showAnswer) {
                                if (isCorrectAnswer) btnStyles = "bg-green-500/20 border-green-500 text-green-300 font-medium"
                                else if (isWrongSelected) btnStyles = "bg-red-500/20 border-red-500 text-red-300 font-medium"
                                else btnStyles = "bg-white/5 border-white/10 opacity-50"
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => !showAnswer && handleAnswer(opt)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${btnStyles}`}
                                >
                                    {opt}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Feedback + next */}
                {showAnswer && (
                    <div className="space-y-3">
                        <div className={`p-4 rounded-xl border ${selected === question.correct ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                            {selected === question.correct
                                ? "✅ ¡Correcto! Vas mejorando esta pregunta."
                                : `❌ Respuesta correcta: "${question.correct}"`}
                        </div>
                        <button
                            onClick={nextQuestion}
                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold py-4 rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg shadow-amber-500/20"
                        >
                            {currentQuestion + 1 >= questions.length ? "Ver resultados" : "Siguiente →"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SmartReview
