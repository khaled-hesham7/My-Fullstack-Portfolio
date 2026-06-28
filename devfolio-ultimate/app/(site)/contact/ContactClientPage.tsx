"use client";

import { useState, useEffect } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import {
  fadeInUp,
  fadeIn,
  slideInLeft,
  slideInRight,
} from "@/utils/animations";
import { getApiBaseUrl } from "@/lib/utils";

interface ContactEmail {
  label: string;
  email: string;
}

interface ContactPhone {
  label: string;
  phone: string;
}

interface ContactLocation {
  address: string;
  gps_link?: string;
}

interface ContactSettings {
  emails: ContactEmail[];
  phones: ContactPhone[];
  locations: ContactLocation[];
}

interface FormData {
  name: string;
  email: string;
  message: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

export default function ContactClientPage() {
  const [settings, setSettings] = useState<ContactSettings>({
    emails: [],
    phones: [],
    locations: [],
  });
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/contact/settings`);
        if (res.ok) {
          const payload = await res.json();
          if (payload.success && payload.data) {
            setSettings(payload.data);
          }
        }
      } catch (err) {
        console.error("Failed to load contact settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 422) {
          const data = await response.json();
          setErrors(data.errors || {});
          setErrorMessage(data.message || "Please correct the errors below.");
          setStatus("error");
          return;
        }
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setSuccessMessage(data.message || "Your message has been sent successfully!");
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
      setErrorMessage("Failed to send message. Please try again later.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <motion.h1 className="text-4xl font-bold mb-8 text-center text-white/95" {...fadeInUp}>
        Contact Me
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <motion.div className="space-y-8" {...slideInLeft}>
          <motion.div {...fadeInUp}>
            <h2 className="text-2xl font-semibold mb-4 text-white/90">Get in Touch</h2>
            <p className="text-slate-400">
              I&apos;m always open to discussing new projects, creative ideas,
              or opportunities to be part of your visions. Feel free to reach
              out through any of the channels below or send a message directly.
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            {/* Emails List */}
            {settings.emails && settings.emails.length > 0 && (
              <motion.div className="space-y-4" variants={fadeInUp}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Emails</h3>
                {settings.emails.map((e, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-slate-950/20 border border-slate-900 rounded-xl p-3 hover:border-slate-800 transition-all">
                    <FaEnvelope className="h-5 w-5 text-cyan-400" />
                    <div>
                      <span className="text-[10px] text-cyan-500/80 font-bold uppercase tracking-wide">{e.label}</span>
                      <p>
                        <a href={`mailto:${e.email}`} className="text-slate-300 hover:text-cyan-400 text-sm transition-colors">
                          {e.email}
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Phones List */}
            {settings.phones && settings.phones.length > 0 && (
              <motion.div className="space-y-4" variants={fadeInUp}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Numbers</h3>
                {settings.phones.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-slate-950/20 border border-slate-900 rounded-xl p-3 hover:border-slate-800 transition-all">
                    <FaPhone className="h-5 w-5 text-cyan-400" />
                    <div>
                      <span className="text-[10px] text-cyan-500/80 font-bold uppercase tracking-wide">{p.label}</span>
                      <p>
                        <a href={`tel:${p.phone}`} className="text-slate-300 hover:text-cyan-400 text-sm transition-colors">
                          {p.phone}
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Locations List */}
            {settings.locations && settings.locations.length > 0 && (
              <motion.div className="space-y-4" variants={fadeInUp}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Locations & GPS</h3>
                {settings.locations.map((l, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-slate-950/20 border border-slate-900 rounded-xl p-3 hover:border-slate-800 transition-all">
                    <FaMapMarkerAlt className="h-5 w-5 text-cyan-400" />
                    <div className="flex-1">
                      <span className="text-[10px] text-cyan-500/80 font-bold uppercase tracking-wide">Location #{idx + 1}</span>
                      {l.gps_link ? (
                        <p>
                          <a
                            href={l.gps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-300 hover:text-cyan-400 text-sm transition-colors underline flex items-center gap-1.5"
                          >
                            {l.address} <span className="text-[10px] text-cyan-500 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded-full">Open Map 🗺️</span>
                          </a>
                        </p>
                      ) : (
                        <p className="text-slate-300 text-sm">{l.address}</p>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          className="bg-slate-900/40 border border-slate-800/85 p-6 rounded-2xl shadow-xl backdrop-blur-sm"
          {...slideInRight}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >

            <motion.div variants={fadeInUp}>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Your Name <span className="text-cyan-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full h-11 px-4 rounded-xl border text-sm bg-slate-950 text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all ${
                  errors.name ? "border-red-500" : "border-slate-800"
                }`}
                placeholder="E.g. Khaled Hesham"
              />
              {errors.name && errors.name.map((err, i) => (
                <p key={i} className="text-red-500 text-xs mt-1">{err}</p>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Your Email <span className="text-cyan-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full h-11 px-4 rounded-xl border text-sm bg-slate-950 text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all ${
                  errors.email ? "border-red-500" : "border-slate-800"
                }`}
                placeholder="E.g. client@example.com"
              />
              {errors.email && errors.email.map((err, i) => (
                <p key={i} className="text-red-500 text-xs mt-1">{err}</p>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label
                htmlFor="message"
                className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2"
              >
                Message Body <span className="text-cyan-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-950 text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all ${
                  errors.message ? "border-red-500" : "border-slate-800"
                }`}
                placeholder="Write your message here (min 10 characters)..."
              />
              {errors.message && errors.message.map((err, i) => (
                <p key={i} className="text-red-500 text-xs mt-1">{err}</p>
              ))}
            </motion.div>

            <motion.button
              type="submit"
              disabled={status === "loading"}
              className="w-full h-11 bg-cyan-500 text-white hover:bg-cyan-600 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer font-semibold rounded-xl text-sm disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {status === "loading" ? "Sending Message..." : "Send Message"}
            </motion.button>

            {status === "success" && (
              <motion.p
                className="text-green-400 text-center text-xs font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {successMessage || "Your message has been sent successfully!"}
              </motion.p>
            )}

            {status === "error" && (
              <motion.p
                className="text-red-400 text-center text-xs font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errorMessage || "Failed to send message. Please try again."}
              </motion.p>
            )}
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
