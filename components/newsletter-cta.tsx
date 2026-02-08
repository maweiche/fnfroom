"use client";

import { motion } from "framer-motion";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { useState, FormEvent } from "react";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Simulate API call - replace with actual newsletter signup
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStatus("success");
    setMessage("Thanks for subscribing!");
    setEmail("");

    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-transparent to-primary-light/20">
      <div className="container-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-cloud-gray dark:from-card dark:to-navy-header border border-border shadow-card p-8 md:p-12">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-0" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-football/10 rounded-full blur-3xl -z-0" />

            <div className="relative z-10">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6"
              >
                <Mail className="w-8 h-8 text-primary" />
              </motion.div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Never Miss a Play
              </h2>
              <p className="text-lg text-secondary mb-8 max-w-2xl">
                Get NC prep sports news, rankings updates, and exclusive highlights delivered to your inbox every week.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={status === "loading" || status === "success"}
                      className="w-full px-6 py-4 bg-background/80 backdrop-blur-sm border-2 border-border rounded-xl text-base placeholder:text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    whileHover={{ scale: status === "idle" || status === "error" ? 1.02 : 1 }}
                    whileTap={{ scale: status === "idle" || status === "error" ? 0.98 : 1 }}
                    className="group relative px-8 py-4 bg-primary text-primary-dark font-semibold rounded-xl hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    {/* Button Background Animation */}
                    {status === "loading" && (
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                    )}

                    <span className="relative flex items-center gap-2">
                      {status === "loading" ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Send className="w-5 h-5" />
                          </motion.div>
                          Subscribing...
                        </>
                      ) : status === "success" ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Subscribed!
                        </>
                      ) : (
                        <>
                          Subscribe
                          <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>

                {/* Status Message */}
                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-3 text-sm ${
                      status === "success" ? "text-success" : "text-error"
                    }`}
                  >
                    {message}
                  </motion.p>
                )}
              </form>

              {/* Trust Badges */}
              <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>No spam, ever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Unsubscribe anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Weekly updates</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
