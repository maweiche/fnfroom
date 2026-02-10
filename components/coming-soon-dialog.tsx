"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";

export function ComingSoonDialog({
  trigger,
  title = "Hold Your Horses",
  variant = "default",
}: {
  trigger: React.ReactNode;
  title?: string;
  variant?: "default" | "beer-cooler" | "college";
}) {
  const [open, setOpen] = useState(false);

  const messages = {
    default: {
      title: "Hold Your Horses",
      description:
        "This feature is coming soon. In the meantime, maybe take a moment to sit with your thoughts? We hear that's good for you or something.",
    },
    "beer-cooler": {
      title: "Slow Down There, Champ",
      description:
        "We're not quite ready to immortalize your rec league exploits just yet. For now, why don't you grab a cold one and reflect on that game-winning shot you definitely made (we believe you, promise).",
    },
    college: {
      title: "Patience, Grasshopper",
      description:
        "We're still building out our college tracking database. In the meantime, feel free to sit quietly and contemplate whether that scholarship was really 'basically a D1 offer.' Character building, you know?",
    },
  };

  const message = messages[variant];

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
              <Coffee className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">
              {message.title}
            </DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed pt-2">
              {message.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setOpen(false)}
              className="bg-primary text-primary-dark hover:opacity-90"
            >
              Got It, I'll Wait
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
