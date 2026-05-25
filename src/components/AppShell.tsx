"use client";

import { ReactLenis } from "lenis/react";
import { useState } from "react";
import { Preloader } from "./Preloader";
import { Cursor } from "./Cursor";
import { Navigation } from "./Navigation";
import { ScrollProgress } from "./ScrollProgress";
import { LightboxProvider } from "./ui/Lightbox";
import { IntroContext } from "@/lib/intro";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <IntroContext.Provider value={{ introDone }}>
      <ReactLenis
        root
        options={{
          lerp: 0.06,
          wheelMultiplier: 0.95,
          smoothWheel: true,
          touchMultiplier: 1.4,
        }}
      >
        <LightboxProvider>
          <Cursor />
          <Navigation introDone={introDone} />
          <ScrollProgress introDone={introDone} />
          <main id="top">{children}</main>
          <Preloader onDone={() => setIntroDone(true)} />
        </LightboxProvider>
      </ReactLenis>
    </IntroContext.Provider>
  );
}
