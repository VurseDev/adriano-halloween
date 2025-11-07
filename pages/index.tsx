import React, { useState } from "react";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const [flash, setFlash] = useState(false);
  const [bgAudio, setBgAudio] = useState<HTMLAudioElement | null>(null);

  // 🎵 Background music
  React.useEffect(() => {
    const audio = new Audio("/halloween-song.mp3");
    audio.loop = true;
    audio.volume = 0.6;

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

  // 🍬 Trick or Treat button action
  const handleTrickOrTreat = () => {
    if (bgAudio) {
      bgAudio.pause();
      bgAudio.currentTime = 0;
    }

    const trickSound = new Audio("/scream-1.mp3");
    trickSound.volume = 1;
    trickSound.currentTime = 0;
    trickSound.play().catch((err) => console.warn("Trick sound blocked:", err));

    requestAnimationFrame(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 1200); // flash lasts ~1.2s
    });

    // vibrate on phones
    if (navigator.vibrate) navigator.vibrate(200);


  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 relative overflow-hidden">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>&nbsp;</span>
          <span className={title({ color: "yellow" })}>
            HALLOWEEN 2 REG CINCO&nbsp;
          </span>
          <br />
          <div className={subtitle({ class: "mt-4" })}>Participe Agora!</div>
        </div>

        <div className="flex flex-col gap-4 mt-4 items-center">
          <Link
            isExternal
            className="bg-gradient-to-tr from-[#FF705B] to-[#FFB457] text-white shadow-lg hover:shadow-2xl font-semibold px-4 py-2 rounded-full inline-flex items-center justify-center"
            href={siteConfig.links.login}
          >
            Participar
          </Link>

          {/* 🎃 Trick or Treat Button */}
          <button
            onClick={handleTrickOrTreat}
            className="bg-black text-white border-2 border-orange-400 px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-all duration-200 active:scale-95"
          >
            🎃 Surpresa
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

        {/* Flash effect overlay */}
        {flash && (
          <div className="fixed inset-0 z-[9999] animate-flash pointer-events-none"></div>
        )}
      </section>

      <style jsx global>{`
        @keyframes flash {
          0%, 100% {
            opacity: 0;
          }
          20%, 40%, 60%, 80% {
            opacity: 1;
            background: white;
          }
          10%, 30%, 50%, 70%, 90% {
            opacity: 1;
            background: black;
          }
        }
        .animate-flash {
          animation: flash 1.5s ease-in-out;
        }
      `}</style>
    </DefaultLayout>
  );
}
