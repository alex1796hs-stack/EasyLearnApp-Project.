import { useState, useEffect } from "react"
import api from "../api/api"
import { useNavigate } from "react-router-dom"
import Background from "../components/Background"

function Placement() {

    const [questions, setQuestions] = useState([])
    const [answers, setAnswers] = useState({})
    const [loading, setLoading] = useState(true)
    const [result, setResult] = useState(null)
    const [audioState, setAudioState] = useState({ state: 'idle', currentText: null })
    const navigate = useNavigate()

    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel()
        }
    }, [])

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

    // 🟢 cargar preguntas
    useEffect(() => {

        const startPlacement = async () => {
            try {
                const res = await api.post("/placement/start")
                setQuestions(res.data.questions)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        startPlacement()

    }, [])

    // 🟡 guardar respuesta
    const handleAnswer = (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: value
        })
    }

    // 🔵 enviar test
    const handleSubmit = async () => {

        const formattedAnswers = Object.entries(answers).map(([question_id, answer]) => ({
            question_id: parseInt(question_id, 10),
            answer
        }))

        if (formattedAnswers.length === 0) {
            alert("No has respondido ninguna pregunta. Por favor, selecciona alguna respuesta antes de enviar.")
            return
        }

        try {

            const res = await api.post("/placement/submit", {
                answers: formattedAnswers
            })

            setResult(res.data)

        } catch (err) {
            console.error(err)
        }

    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    if (result) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white pb-12 pt-8 px-4 relative overflow-hidden">
                <Background />
                <div className="max-w-3xl mx-auto relative z-10">
                    <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/10 text-center mb-10 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 mix-blend-overlay"></div>
                        <h1 className="text-2xl font-bold text-gray-300 mb-2 relative z-10">Nivel Asignado:</h1>
                        <p className="text-8xl font-black bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent my-6 relative z-10 drop-shadow-sm">{result.level}</p>
                        <p className="text-xl font-medium text-blue-200 relative z-10">Puntuación Total: <span className="text-white font-bold">{result.score} pts</span></p>
                    </div>

                    <div className="space-y-4 mb-10">
                        <h2 className="text-xl font-bold text-gray-200 mb-6 pl-2 border-l-4 border-blue-500">Resumen detallado de tus respuestas:</h2>
                        {result.summary.map((item, idx) => (
                            <div key={idx} className={`p-6 rounded-2xl border ${item.is_correct ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'} backdrop-blur-sm transition-all hover:bg-white/5`}>
                                <p className="font-semibold text-lg text-white mb-4">{item.question}</p>
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2">
                                        <span className="text-gray-400 text-sm w-32 shrink-0">Tu respuesta:</span>
                                        <span className={`font-medium px-3 py-1 bg-white/5 rounded-lg ${item.is_correct ? 'text-emerald-400' : 'text-red-400'}`}>{item.user_answer}</span>
                                    </p>
                                    {!item.is_correct && (
                                        <p className="flex items-center gap-2">
                                            <span className="text-gray-400 text-sm w-32 shrink-0">Correcta:</span>
                                            <span className="font-medium text-emerald-400 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">{item.correct_answer}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                        Continuar al Dashboard →
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
            <Background />

            <div className="max-w-3xl mx-auto px-6 pt-10 pb-16 relative z-10">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mb-8 flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium"
                >
                    <span>←</span> Salir y volver al Dashboard
                </button>

                <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Placement Test
                </h1>
                <p className="text-blue-200 mb-10 pb-6 border-b border-white/10">Responde las siguientes {questions.length} preguntas para evaluar tu nivel del idioma.</p>

                <div className="space-y-8 mb-12">
                    {questions.map((q, index) => (
                        <div key={q.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl">
                            <p className="text-sm text-blue-400 font-semibold mb-2">Pregunta {index + 1}</p>
                            
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <p className="text-xl font-medium leading-relaxed">{q.question}</p>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleAudio(q.question); }}
                                    className="shrink-0 p-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors rounded-full border border-blue-500/20"
                                    title={audioState.currentText === q.question && audioState.state === 'playing' ? "Pausar" : "Escuchar pronunciación"}
                                >
                                    {audioState.currentText === q.question && audioState.state === 'playing' ? (
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

                            <div className="grid gap-3">
                                {q.options.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleAnswer(q.id, opt)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${answers[q.id] === opt 
                                            ? "bg-blue-600/30 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-400 font-medium" 
                                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 flex shrink-0 items-center justify-center rounded-full border ${answers[q.id] === opt ? 'border-blue-400' : 'border-gray-500'}`}>
                                                {answers[q.id] === opt && <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>}
                                            </div>
                                            <span>{opt}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-6 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl max-w-sm mx-auto shadow-2xl flex flex-col items-center">
                    <p className="text-sm mb-3">
                        Respondidas: <span className="font-bold text-blue-400">{Object.keys(answers).length}</span> de {questions.length}
                    </p>
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                        Finalizar y Enviar Test
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Placement