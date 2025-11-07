import React, { useEffect, useState } from "react";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { GithubIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const [flash, setFlash] = useState(false);
  const [bgAudio, setBgAudio] = useState<HTMLAudioElement | null>(null);

  // 👻 Background music effect
  useEffect(() => {
    const audio = new Audio("/halloween-song.mp3");
    audio.loop = true;
    audio.volume = 0.8;

    const enableAudio = () => {
      audio.play().catch((err) => console.warn("Autoplay prevented:", err));
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("scroll", enableAudio);
      document.removeEventListener("keydown", enableAudio);
    };

    document.addEventListener("click", enableAudio);
    document.addEventListener("scroll", enableAudio);
    document.addEventListener("keydown", enableAudio);

    setBgAudio(audio);

    return () => {
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("scroll", enableAudio);
      document.removeEventListener("keydown", enableAudio);
    };
  }, []);

  // 🕹️ Trick or Treat button handler
  const handleTrickOrTreat = () => {
    // Pause Halloween background song instantly
    if (bgAudio) {
      bgAudio.pause();
      bgAudio.currentTime = 0;
    }

    // Play trick sound immediately
    const trickSound = new Audio("/trick-or-treat.mp3");
    trickSound.volume = 0.9;
    trickSound.currentTime = 0;
    trickSound.play().catch((err) => console.warn("Trick sound blocked:", err));

    // Trigger screen flash at the exact same time
    requestAnimationFrame(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 1200); // flash lasts ~1.2s
    });

    // Optional mobile vibration
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 relative">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>&nbsp;</span>
          <span className={title({ color: "yellow" })}>
            HALLOWEEN 2 REG CINCO&nbsp;
          </span>
          <br />
          <div className={subtitle({ class: "mt-4" })}>Participe Agora!</div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleTrickOrTreat}
            className="bg-gradient-to-tr from-[#FF705B] to-[#FFB457] text-white shadow-lg hover:shadow-2xl active:scale-95 transition-all font-semibold px-6 py-3 rounded-full"
          >
            🎃 Trick or Treat
          </button>
          <Link
            isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href={siteConfig.links.github}
          >
            <GithubIcon size={20} />
            GitHub
          </Link>
        </div>

        <div className="mt-8">
          <Snippet hideCopyButton hideSymbol variant="bordered">
            <span>
              Projeto feito por <Code color="primary">VurseDev</Code>
            </span>
          </Snippet>
        </div>

        {/* Flash overlay */}
        {flash && (
          <div className="fixed inset-0 z-[9999] animate-flash pointer-events-none"></div>
        )}
      </section>

      {/* ⚡ Flash animation */}
      <style jsx global>{`
        @keyframes flash {
          0%,
          100% {
            background: black;
            opacity: 0;
          }
          10% {
            background: white;
            opacity: 1;
          }
          20% {
            background: black;
            opacity: 1;
          }
          30% {
            background: white;
            opacity: 1;
          }
          40% {
            background: black;
            opacity: 1;
          }
          50% {
            background: white;
            opacity: 1;
          }
          60% {
            background: black;
            opacity: 1;
          }
          70% {
            background: white;
            opacity: 1;
          }
          80% {
            background: black;
            opacity: 1;
          }
          90% {
            background: white;
            opacity: 1;
          }
        }
        .animate-flash {
          animation: flash 1.2s ease-in-out;
        }
      `}</style>
    </DefaultLayout>
  );
}
