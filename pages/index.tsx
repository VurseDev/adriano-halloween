import React from "react";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {

React.useEffect(() => {
  const cursor = document.createElement("div");
  cursor.style.position = "fixed";
  cursor.style.pointerEvents = "none";
  cursor.style.fontSize = "24px";
  cursor.textContent = "👻";
  document.body.appendChild(cursor);

  const move = (e) => {
    cursor.style.left = e.pageX + "px";
    cursor.style.top = e.pageY + "px";
  };
  document.addEventListener("mousemove", move);
  return () => document.removeEventListener("mousemove", move);
}, []);

  React.useEffect(() => {
    const audio = new Audio('/halloween-song.mp3');
    audio.loop = true;
    audio.volume = 0.8;
  
    // Function to play when user interacts
    const enableAudio = () => {
      audio.play().catch(err => {
        console.warn("Autoplay prevented:", err);
      });
      // Remove event listeners so it only runs once
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("scroll", enableAudio);
      document.removeEventListener("keydown", enableAudio);
    };
  
    // Add listeners for any user interaction
    document.addEventListener("click", enableAudio);
    document.addEventListener("scroll", enableAudio);
    document.addEventListener("keydown", enableAudio);
  
    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("scroll", enableAudio);
      document.removeEventListener("keydown", enableAudio);
    };
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}> &nbsp;</span>
          <span className={title({color: "yellow" })}> HALLOWEEN 2 REG CINCO&nbsp;</span>
          <br />
          <span className={title()}>
            
          </span>
          <div className={subtitle({ class: "mt-4" })}>
            Participe Agora!
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            isExternal
            className="bg-gradient-to-tr from-[#FF705B] to-[#FFB457] text-white shadow-lg hover:shadow-2xl font-semibold px-4 py-2 rounded-full inline-flex items-center justify-center   "
            href={siteConfig.links.login}
          >
            Participar
          </Link>
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
              Projeto feito por {" "}
              <Code color="primary">VurseDev</Code>
            </span>
          </Snippet>
        </div>
      </section>
    </DefaultLayout>
  );
}
