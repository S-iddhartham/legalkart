import { site } from "@/config/site";

export interface Faq {
  q: string;
  /** Plain-text answer (also used for FAQPage structured data). */
  a: string;
  link?: { label: string; href: string };
}

/**
 * Product FAQ. Answers describe how the flows in this codebase behave; amounts
 * and policy specifics are deliberately deferred to the pricing shown in-flow
 * and to the linked policy pages so they cannot drift out of date.
 */
export const HOME_FAQ: Faq[] = [
  {
    q: "How does Talk to a Lawyer work?",
    a: "Choose a lawyer, tap Call and sign in. You’ll see the lawyer’s per-minute rate and your wallet balance before anything starts. The call is charged per minute from your wallet and you can end it at any time.",
    link: { label: "Find a lawyer to call", href: "/consult?mode=call" },
  },
  {
    q: "How does Chat with a Lawyer work?",
    a: "Chat is a written consultation. Add credits to your wallet, pick an advocate and start chatting. Credits are deducted per minute of the chat at the advocate’s chat rate, and you keep the conversation for reference.",
    link: { label: "Find a lawyer to chat", href: "/consult?mode=chat" },
  },
  {
    q: "How are consultation rates calculated?",
    a: "Each lawyer sets their own per-minute rate, which can differ for calls and chats. Some lawyers offer a reduced rate for a period; when that applies you’ll see the reduced rate alongside the standard one. The exact rate is always shown before you start.",
  },
  {
    q: "How do chat credits and wallet balance work?",
    a: "Your wallet holds prepaid credits that can be used with any lawyer. When you start a consultation the per-minute rate is deducted from your balance while it runs. If your balance is below what’s needed to start, you’ll be asked to add credits first.",
  },
  {
    q: "What is the difference between AI Review and Lawyer Review?",
    a: "AI Document Review gives you an instant automated read-out of a document — useful as a first check, but it is not legal advice. Lawyer Document Review is done by a practising advocate who reads your document and sends you a written report.",
    link: { label: "Compare document review options", href: "/services/lawyer-document-review" },
  },
  {
    q: "How do I purchase legal products?",
    a: "Open the product from the Services section or the Document, Startup and Property menus, review what’s included and the price, then check out. You’ll need to be signed in to complete payment.",
  },
  {
    q: "What happens after payment?",
    a: "Your purchase is confirmed once our payment partner confirms the payment. For consultations your wallet is updated and you can start straight away; for products and reviews you’ll receive the next steps for that service. If a payment is still being confirmed, please don’t pay again — the status updates automatically.",
  },
  {
    q: "Why is the mobile app required for some services?",
    a: "Some features rely on the phone — for example receiving calls and notifications when a lawyer responds. Where a service needs the app, we’ll say so before you pay.",
  },
  {
    q: "How can I contact support?",
    a: `Our support team is available ${site.support.hours} on ${site.support.phone}. You can also reach us through the contact page.`,
    link: { label: "Contact us", href: site.routes.contact },
  },
];
