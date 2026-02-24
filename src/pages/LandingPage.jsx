import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ChevronRight, Utensils, Zap, Rocket, Star, ShieldCheck } from 'lucide-react';

const ASSETS = {
    ufo3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Flying%20saucer/3D/flying_saucer_3d.png",
    burger3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hamburger/3D/hamburger_3d.png",
    pizza3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pizza/3D/pizza_3d.png",
};

const LandingPage = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // --- SCROLL PHYSICS ---
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Make the UFO fly up and shrink slightly as you scroll down
    const ufoScrollY = useTransform(scrollYProgress, [0, 1], ['0%', '-250%']);
    const ufoScrollScale = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
    const ufoScrollRotateY = useTransform(scrollYProgress, [0, 1], [0, 180]);

    // --- MOUSE PARALLAX PHYSICS ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothMouseX = useSpring(mouseX, { damping: 40, stiffness: 100, mass: 0.8 });
    const smoothMouseY = useSpring(mouseY, { damping: 40, stiffness: 100, mass: 0.8 });

    // UFO Parallax (Pops out, highly reactive)
    const ufoX = useTransform(smoothMouseX, [-1, 1], [-80, 80]);
    const ufoY = useTransform(smoothMouseY, [-1, 1], [-80, 80]);
    const ufoRotateX = useTransform(smoothMouseY, [-1, 1], [25, -25]);
    const ufoRotateYBase = useTransform(smoothMouseX, [-1, 1], [-35, 35]);

    // Combine Scroll Rotate with Parallax Rotate
    const ufoRotateY = useTransform(() => ufoRotateYBase.get() + ufoScrollRotateY.get());

    // Space Background Parallax (Moves opposite, creates extreme depth)
    const bgX = useTransform(smoothMouseX, [-1, 1], [30, -30]);
    const bgY = useTransform(smoothMouseY, [-1, 1], [30, -30]);

    // Floating Debris Parallax inside Portal
    const debris1X = useTransform(smoothMouseX, [-1, 1], [-40, 40]);
    const debris1Y = useTransform(smoothMouseY, [-1, 1], [-40, 40]);
    const debris2X = useTransform(smoothMouseX, [-1, 1], [60, -60]);
    const debris2Y = useTransform(smoothMouseY, [-1, 1], [60, -60]);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        // Normalize mouse coordinates to -1 -> 1
        mouseX.set((clientX / innerWidth) * 2 - 1);
        mouseY.set((clientY / innerHeight) * 2 - 1);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="w-full bg-[#f4f4f6] text-gray-900 font-sans min-h-[250vh] relative overflow-x-hidden selection:bg-indigo-500 selection:text-white"
        >
            {/* NAVBAR */}
            <nav className="fixed w-full z-50 top-0 px-6 md:px-12 py-6 flex justify-between items-center pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => navigate('/home')}>
                    <div className="bg-black text-white p-2 rounded-xl">
                        <Rocket className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-2xl tracking-tight text-black">FutureSpace</span>
                </div>
                <div className="hidden md:flex items-center gap-10 font-bold text-sm pointer-events-auto text-gray-500">
                    <button className="hover:text-black transition-colors">Home</button>
                    <button className="hover:text-black transition-colors">About</button>
                    <button className="hover:text-black transition-colors">Products</button>
                    <button className="hover:text-black transition-colors">Contact</button>
                    <button onClick={() => navigate('/home')} className="bg-black text-white px-8 py-3 rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 font-black shadow-lg">
                        Order Now
                    </button>
                </div>
            </nav>

            {/* STICKY HERO SECTION */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col md:flex-row items-center justify-between px-6 md:px-16 pt-24 md:pt-0">

                {/* LEFT: UI & Typography */}
                <div className="w-full md:w-[45%] z-20 flex flex-col justify-center h-full pb-10 md:pb-20 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="pointer-events-auto"
                    >
                        <p className="text-xs md:text-sm font-bold tracking-widest text-gray-500 uppercase mb-4 flex items-center gap-2">
                            <span className="w-8 h-px bg-indigo-500" /> Explore the Cosmos with FoodExpress
                        </p>
                        <h1 className="text-6xl md:text-[6rem] font-bold leading-[1.05] tracking-tighter mb-8 text-black">
                            FoodExpress: <br />
                            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 block mt-2">Universe.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 font-medium max-w-md mb-12 leading-relaxed">
                            Discover the future of food delivery. We're blasting off to bring you the most innovative, sustainable dining across the galaxy.
                        </p>
                        <button onClick={() => navigate('/home')} className="bg-black text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-4 group w-full md:w-auto justify-center">
                            Order Now
                            <motion.div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 group-hover:bg-white/30 transition-all">
                                <ChevronRight className="w-5 h-5 text-white" />
                            </motion.div>
                        </button>
                    </motion.div>
                </div>

                {/* RIGHT: The 3D Portal */}
                <div className="absolute top-[60%] md:top-1/2 -translate-y-1/2 right-[-5%] w-[110%] md:w-[60%] h-[70vh] md:h-[95vh] z-0 pointer-events-none">
                    <motion.div
                        className="w-full h-full rounded-[3rem] md:rounded-[4rem] overflow-hidden relative shadow-[0_30px_100px_rgba(0,0,0,0.4)] bg-[#050510]"
                        initial={{ opacity: 0, scale: 0.95, x: 100 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        style={{ perspective: 1200 }}
                    >
                        {/* Deep Space Background (Parallaxing) */}
                        <motion.div
                            className="absolute inset-[-15%] w-[130%] h-[130%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-[#050510] to-black"
                            style={{ x: bgX, y: bgY }}
                        >
                            {/* Starfield generated via CSS for performance */}
                            <div className="absolute inset-0 opacity-40 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                            <div className="absolute inset-0 opacity-20 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle, #a5b4fc 2px, transparent 2px)', backgroundSize: '150px 150px', backgroundPosition: '30px 30px' }} />

                            {/* Nebula Glows */}
                            <div className="absolute top-[20%] right-[20%] w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] animate-pulse mix-blend-screen" />
                            <div className="absolute bottom-[20%] left-[30%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
                        </motion.div>

                        {/* Floating Debris Inside The Portal */}
                        <motion.img
                            src={ASSETS.pizza3D}
                            className="absolute top-[15%] right-[25%] w-32 md:w-48 h-32 md:h-48 object-contain opacity-90 filter blur-[2px] drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
                            style={{ x: debris1X, y: debris1Y }}
                            animate={{ rotateZ: 360 }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                        />
                        <motion.img
                            src={ASSETS.burger3D}
                            className="absolute bottom-[10%] left-[15%] w-40 md:w-56 h-40 md:h-56 object-contain opacity-70 filter blur-[4px] drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                            style={{ x: debris2X, y: debris2Y }}
                            animate={{ rotateZ: -360 }} transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                        />
                    </motion.div>
                </div>

                {/* HERO UFO (Overlapping the Portal and the UI) */}
                <div className="absolute top-[60%] md:top-1/2 left-1/2 md:left-[55%] -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none" style={{ perspective: 1500 }}>
                    <motion.div
                        style={{
                            x: ufoX,
                            y: ufoY,
                            rotateX: ufoRotateX,
                            rotateY: ufoRotateY,
                            scale: ufoScrollScale,
                            translateY: ufoScrollY
                        }}
                        className="relative"
                    >
                        {/* UFO Engine Glow */}
                        <div className="absolute inset-x-[10%] bottom-[5%] h-[40%] bg-fuchsia-500/50 rounded-full blur-[50px] animate-pulse mix-blend-screen" />

                        <motion.img
                            initial={{ opacity: 0, scale: 0.5, y: 100 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1.5, type: 'spring', bounce: 0.4 }}
                            src={ASSETS.ufo3D}
                            alt="UFO"
                            className="w-[350px] h-[350px] md:w-[800px] md:h-[800px] object-contain drop-shadow-[0_60px_80px_rgba(0,0,0,0.6)]"
                        />
                    </motion.div>
                </div>

            </div>

            {/* EXTRA SCROLL CONTENT TO SHOW OFF PARALLAX */}
            <div className="relative z-40 bg-white min-h-screen px-6 md:px-16 py-32 rounded-t-[3rem] md:rounded-t-[4rem] shadow-[0_-30px_80px_rgba(0,0,0,0.1)] flex flex-col items-center text-center mt-[-10vh]">
                <motion.div
                    initial={{ opacity: 0, y: 80 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-indigo-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-sm border border-indigo-100">
                        <Zap className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight text-gray-900">Seamless Intergalactic Delivery.</h2>
                    <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-medium mb-16">
                        Our interstellar fleet guarantees hot food at your coordinates faster than light. Say goodbye to cold fries and hello to the future of dining.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {[
                            { icon: Rocket, title: "Warp Speed", desc: "Arrives before you even click order." },
                            { icon: ShieldCheck, title: "Secure Orbit", desc: "Your food is protected in an anti-gravity stasis field." },
                            { icon: Utensils, title: "Universal Taste", desc: "Sourced from the finest galactic chefs." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100/50 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer group">
                                <item.icon className="w-8 h-8 text-indigo-500 mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-500 font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

        </div>
    );
};

export default LandingPage;
