"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { whatsappLink } from "@/lib/whatsapp";

/** No email backend: the message opens in WhatsApp, ready to send. */
export function ContactForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        window.open(whatsappLink(`الاسم: ${name}\n${message}`), "_blank", "noopener");
      }}
    >
      <Field label="الاسم" htmlFor="c-name">
        <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="رسالتك" htmlFor="c-message">
        <Textarea id="c-message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required />
      </Field>
      <Button type="submit" variant="whatsapp" className="self-start">
        <WhatsAppIcon size={20} /> أرسل عبر واتساب
      </Button>
    </form>
  );
}
