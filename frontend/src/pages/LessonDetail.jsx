import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/api"
import Background from "../components/Background"

function LessonDetail() {

    const [lesson, setLesson] = useState(null)
    const [error, setError] = useState(null)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selected, setSelected] = useState(null)
    const [showAnswer, setShowAnswer] = useState(false)
    const [finished, setFinished] = useState(false)
    const [score, setScore] = useState(0)
    const [showPractice, setShowPractice] = useState(false)
    const [audioState, setAudioState] = useState({ state: 'idle', currentText: null })
    const navigate = useNavigate()

    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel()
        }
    }, [])

    useEffect(() => {

        const fetchLesson = async () => {
            try {
                const res = await api.get("/lessons/next")
                setLesson(res.data)
            } catch (err) {
                console.error(err)
                if (err.response && err.response.status === 401) {
                    setError("Sesión caducada. Por favor, cierra sesión y vuelve a entrar.")
                } else {
                    setError("Error cargando la lección o no hay más lecciones.")
                }
            }
        }

        fetchLesson()

    }, [])

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <p className="text-red-400 font-bold text-xl mb-4">{error}</p>
                <button onClick={() => navigate("/dashboard")} className="text-blue-400 hover:text-blue-300 transition underline">← Volver al Dashboard</button>
            </div>
        </div>
    )

    if (!lesson) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    if (!lesson.questions || lesson.questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
                <p className="p-6 text-gray-400">No questions available</p>
            </div>
        )
    }

    const question = lesson.questions[currentQuestion]

    const toggleAudio = (text) => {
        if (!('speechSynthesis' in window)) {
            alert("Tu navegador no soporta el sintetizador de voz.")
            return
        }

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
            synth.cancel() // Stop any current audio
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

        const isCorrect = option === question.correct
        if (isCorrect) {
            setScore((prev) => prev + 1)
        }

        try {
            await api.post("/answers", {
                question_id: question.id,
                is_correct: isCorrect
            })
        } catch (err) {
            console.error("Error saving answer:", err)
        }
    }

    const nextQuestion = async () => {

        if (currentQuestion + 1 >= lesson.questions.length) {

            setFinished(true)

            try {
                await api.post(`/progress/${lesson.id}`)
            } catch (err) {
                console.error("Error saving progress:", err)
            }

            return
        }

        setCurrentQuestion(prev => prev + 1)
        setSelected(null)
        setShowAnswer(false)
    }

    if (finished) {
        const percentage = Math.round((score / lesson.questions.length) * 100)
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
                <Background />
                <div className="max-w-md w-full bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-xl text-center relative z-10">
                    <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{lesson.title}</h1>
                    <p className="text-5xl mb-4">🎉</p>
                    <p className="text-xl font-medium mb-6">¡Lección completada!</p>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 mb-8">
                        <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Puntuación Final</p>
                        <p className="text-3xl font-bold text-white mb-2">{percentage}%</p>
                        <p className="text-sm text-gray-400">{score}/{lesson.questions.length} correctas</p>
                    </div>
                    <button
                        onClick={() => window.location.href = "/dashboard"}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        )
    }

    if (!showPractice) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
                <Background />

                <div className="max-w-3xl mx-auto px-6 pt-8 pb-10 relative z-10">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mb-6 flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium"
                    >
                        <span>←</span> Volver al Dashboard
                    </button>

                    <h1 className="text-3xl font-black mb-8 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        {lesson.title}
                    </h1>

                    <div className="space-y-6 mb-10">
                        {lesson.content && lesson.content.map((c, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <h2 className="font-bold text-xl text-blue-300">{c.title}</h2>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleAudio(c.explanation); }}
                                        className="shrink-0 p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors rounded-full border border-blue-500/20"
                                        title={audioState.currentText === c.explanation && audioState.state === 'playing' ? "Pausar" : "Escuchar explicación"}
                                    >
                                        {audioState.currentText === c.explanation && audioState.state === 'playing' ? (
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
                                <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                                    {c.explanation}
                                </p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowPractice(true)}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20 text-lg flex items-center justify-center gap-2"
                    >
                        📝 Empezar Práctica
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
            <Background />
            <div className="max-w-2xl mx-auto px-6 pt-8 pb-10 relative z-10">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mb-6 flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium"
                >
                    <span>←</span> Salir de la lección
                </button>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold text-gray-300 line-clamp-1">
                        {lesson.title}
                    </h1>
                    <span className="shrink-0 bg-white/10 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                        {currentQuestion + 1} / {lesson.questions.length}
                    </span>
                </div>

                <div className="w-full bg-white/10 rounded-full h-1.5 mb-8">
                    <div
                        className="bg-gradient-to-r from-blue-400 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestion) / lesson.questions.length) * 100}%` }}
                    ></div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 shadow-xl mb-6">
                    <div className="flex items-start justify-between gap-4 mb-8">
                        <p className="text-xl font-medium leading-relaxed">
                            {question.question}
                        </p>
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleAudio(question.question); }}
                            className="shrink-0 p-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors rounded-full border border-blue-500/20"
                            title={audioState.currentText === question.question && audioState.state === 'playing' ? "Pausar" : "Escuchar pronunciación"}
                        >
                            {audioState.currentText === question.question && audioState.state === 'playing' ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M17.657 6.343a8 8 0 010 11.314M11 5L6 9H2v6h4l5 4V5z"></path>
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {question.options.map((opt, i) => {
                            const isCorrectAnswer = showAnswer && opt === question.correct;
                            const isWrongSelected = showAnswer && opt === selected && opt !== question.correct;
                            
                            let btnStyles = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50";
                            
                            if (showAnswer) {
                                if (isCorrectAnswer) {
                                    btnStyles = "bg-green-500/20 border-green-500 text-green-300 font-medium";
                                } else if (isWrongSelected) {
                                    btnStyles = "bg-red-500/20 border-red-500 text-red-300 font-medium";
                                } else {
                                    btnStyles = "bg-white/5 border-white/10 opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={i}
                                    onClick={() => !showAnswer && handleAnswer(opt)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${btnStyles}`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {showAnswer && (
                    <button
                        onClick={nextQuestion}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                        Siguiente pregunta →
                    </button>
                )}

            </div>
        </div>
    )
}

export default LessonDetail