import { useEffect, useRef } from "react"

export default function Background({ variant = "default" }) {
    const blob1Ref = useRef(null)
    const blob2Ref = useRef(null)
    const blob3Ref = useRef(null)

    // Current smooth positions for each blob
    const pos1 = useRef({ x: 0.15, y: 0.15 })
    const pos2 = useRef({ x: 0.75, y: 0.70 })
    const pos3 = useRef({ x: 0.50, y: 0.45 })

    // Target positions driven by mouse
    const target1 = useRef({ x: 0.15, y: 0.15 })
    const target2 = useRef({ x: 0.75, y: 0.70 })
    const target3 = useRef({ x: 0.50, y: 0.45 })

    const rafRef = useRef(null)

    useEffect(() => {
        const handleMouseMove = (e) => {
            const mx = e.clientX / window.innerWidth
            const my = e.clientY / window.innerHeight

            // Each blob follows the cursor at a different offset and strength
            target1.current = {
                x: mx * 0.55 + 0.05,
                y: my * 0.55 + 0.05,
            }
            target2.current = {
                x: 1 - mx * 0.50 - 0.05,
                y: 1 - my * 0.45 - 0.05,
            }
            target3.current = {
                x: mx * 0.35 + 0.30,
                y: my * 0.35 + 0.30,
            }
        }

        const animate = () => {
            const lerp = (a, b, t) => a + (b - a) * t

            // Smooth follow with different speeds
            pos1.current.x = lerp(pos1.current.x, target1.current.x, 0.025)
            pos1.current.y = lerp(pos1.current.y, target1.current.y, 0.025)

            pos2.current.x = lerp(pos2.current.x, target2.current.x, 0.018)
            pos2.current.y = lerp(pos2.current.y, target2.current.y, 0.018)

            pos3.current.x = lerp(pos3.current.x, target3.current.x, 0.012)
            pos3.current.y = lerp(pos3.current.y, target3.current.y, 0.012)

            if (blob1Ref.current) {
                blob1Ref.current.style.left = `${pos1.current.x * 100}%`
                blob1Ref.current.style.top = `${pos1.current.y * 100}%`
            }
            if (blob2Ref.current) {
                blob2Ref.current.style.left = `${pos2.current.x * 100}%`
                blob2Ref.current.style.top = `${pos2.current.y * 100}%`
            }
            if (blob3Ref.current) {
                blob3Ref.current.style.left = `${pos3.current.x * 100}%`
                blob3Ref.current.style.top = `${pos3.current.y * 100}%`
            }

            rafRef.current = requestAnimationFrame(animate)
        }

        window.addEventListener("mousemove", handleMouseMove)
        rafRef.current = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    if (variant === "warm") {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                <div
                    ref={blob1Ref}
                    className="absolute rounded-full"
                    style={{
                        width: "55vw",
                        height: "55vw",
                        maxWidth: "680px",
                        maxHeight: "680px",
                        background: "radial-gradient(circle, rgba(217,119,6,0.18) 0%, rgba(234,88,12,0.10) 50%, transparent 75%)",
                        filter: "blur(80px)",
                        transform: "translate(-50%, -50%)",
                        willChange: "left, top",
                        transition: "none",
                    }}
                />
                <div
                    ref={blob2Ref}
                    className="absolute rounded-full"
                    style={{
                        width: "65vw",
                        height: "65vw",
                        maxWidth: "780px",
                        maxHeight: "780px",
                        background: "radial-gradient(circle, rgba(234,88,12,0.16) 0%, rgba(245,158,11,0.09) 50%, transparent 75%)",
                        filter: "blur(100px)",
                        transform: "translate(-50%, -50%)",
                        willChange: "left, top",
                        transition: "none",
                    }}
                />
                <div
                    ref={blob3Ref}
                    className="absolute rounded-full"
                    style={{
                        width: "40vw",
                        height: "40vw",
                        maxWidth: "520px",
                        maxHeight: "520px",
                        background: "radial-gradient(circle, rgba(251,191,36,0.12) 0%, rgba(217,119,6,0.07) 50%, transparent 75%)",
                        filter: "blur(70px)",
                        transform: "translate(-50%, -50%)",
                        willChange: "left, top",
                        transition: "none",
                    }}
                />
            </div>
        )
    }

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            <div
                ref={blob1Ref}
                className="absolute rounded-full"
                style={{
                    width: "55vw",
                    height: "55vw",
                    maxWidth: "700px",
                    maxHeight: "700px",
                    background: "radial-gradient(circle, rgba(59,130,246,0.20) 0%, rgba(99,102,241,0.12) 50%, transparent 75%)",
                    filter: "blur(80px)",
                    transform: "translate(-50%, -50%)",
                    willChange: "left, top",
                    transition: "none",
                }}
            />
            <div
                ref={blob2Ref}
                className="absolute rounded-full"
                style={{
                    width: "65vw",
                    height: "65vw",
                    maxWidth: "820px",
                    maxHeight: "820px",
                    background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(219,39,119,0.10) 50%, transparent 75%)",
                    filter: "blur(100px)",
                    transform: "translate(-50%, -50%)",
                    willChange: "left, top",
                    transition: "none",
                }}
            />
            <div
                ref={blob3Ref}
                className="absolute rounded-full"
                style={{
                    width: "40vw",
                    height: "40vw",
                    maxWidth: "540px",
                    maxHeight: "540px",
                    background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, rgba(59,130,246,0.09) 50%, transparent 75%)",
                    filter: "blur(70px)",
                    transform: "translate(-50%, -50%)",
                    willChange: "left, top",
                    transition: "none",
                }}
            />
        </div>
    )
}
