import Image from "next/image";
import EmailForm from "@/components/email-form";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between bg-black text-white">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl px-4">
        <div className="mb-24">
          {/* Display the logo */}
          <Image 
            src="/logo.png" // Ensure the file is in public/logo.png
            alt="Logo"
            width={150} // Adjust size as needed
            height={100}
          />
        </div>

        <div className="w-full max-w-md">
          <EmailForm />
        </div>
      </div>

      <Footer />
    </main>
  );
}


