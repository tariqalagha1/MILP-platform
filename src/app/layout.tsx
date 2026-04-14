import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

// Font variables are applied via CSS globals — no Google Fonts network call needed
const fontVars = 'font-sans';

export const metadata: Metadata = {
  title: "MILP - Healthcare Revenue Intelligence",
  description: "Revenue Intelligence & Patient Retention Platform for GCC Clinics. Reduce missed appointments and claim losses, prove SAR impact in 60 days.",
  keywords: ["healthcare", "revenue", "GCC", "clinics", "ROI", "no-show", "claims"],
};

// Check if Clerk keys are configured
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = clerkPubKey && !clerkPubKey.includes('placeholder');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html
      lang="en"
      className={`${fontVars} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );

  // Only wrap with ClerkProvider if keys are configured
  if (isClerkConfigured) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
