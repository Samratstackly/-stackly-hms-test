import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/logo.png";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      {/* ──────── GLOBAL LOCK (no scroll, 100vh) ──────── */}
      <style>{`
        html,
        body,
        #root,
        .full-lock {
          margin: 0 !important;
          padding: 0 !important;
          height: 100vh !important;
          height: 100dvh !important;   /* iOS dynamic viewport */
          overflow: hidden !important;
        }
      `}</style>

      {/* ──────── BACKGROUND DOTS (fixed, % based) ──────── */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none">
        {Array.from({ length: 200 }).map((_, i) => {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#0EFF7BCC]"
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: Math.random() * 1 + 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: Math.random() * 1,
              }}
            />
          );
        })}
      </div>

      {/* ──────── MAIN UI (fixed, full-screen) ──────── */}
      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center text-center select-none full-lock">
        {/* Glowing Orb */}
        <motion.div
          className="absolute w-96 h-96 bg-[#0EFF7B33] blur-[150px] rounded-full -z-10"
          initial={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />

        {/* Logo */}
        <motion.img
          src={Logo}
          alt="StacklyCare Logo"
          className="w-[120px] mb-4 drop-shadow-[0_0_15px_#0EFF7B]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />

        {/* 404 */}
        <motion.h1
          className="text-[64px] md:text-[80px] font-bold text-[#0EFF7B] mb-2 tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          404
        </motion.h1>

        <motion.h2
          className="text-[24px] md:text-[28px] font-semibold text-white mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Page Not Found
        </motion.h2>

        <motion.p
          className="text-gray-400 text-[16px] md:text-[18px] max-w-md mx-auto mb-6 leading-relaxed px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          You may not be logged in or the page doesn’t exist. Please log in to
          access the Hospital Management System dashboard.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-lg font-semibold text-black bg-[#0EFF7B] hover:bg-[#0EFF7BCF] shadow-[0_0_20px_#0EFF7B80] transition-all duration-300"
          >
            Go to Login
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-lg font-semibold text-gray-300 border border-gray-700 bg-[#0EFF7B1A] hover:bg-[#0EFF7B33] transition-all duration-300"
          >
            Go Back
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="absolute bottom-2 left-0 right-0 text-gray-600 text-xs text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          © {new Date().getFullYear()} StacklyCare • Empowering Digital Healthcare
        </motion.div>
      </div>
    </>
  );
}