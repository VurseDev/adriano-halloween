import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
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
            className="bg-gradient-to-tr from-[#FF705B] to-[#FFB457] text-white shadow-lg hover:shadow-2xl font-semibold px-4 py-2 rounded-full inline-flex items-center justify-center"
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
