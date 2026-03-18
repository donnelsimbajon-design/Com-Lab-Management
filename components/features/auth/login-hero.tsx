import Image from "next/image";

export function LoginHero() {
  return (
    <div className="relative hidden w-full h-full flex-col bg-black text-white lg:flex justify-between p-12 overflow-hidden shadow-2xl border-r border-white/5">
      {/* Background Image of the Laboratory */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-right bg-no-repeat opacity-60" 
        style={{ backgroundImage: "url('/images/image.png')" }}
      />
      
      {/* Deep Black Gradient fading sharply left to right */}
      {/* Solid black on the left half seamlessly blending into the right image */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
      {/* Bottom to Top gradient to anchor the text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

      {/* Top Branding Section */}
      <div className="relative z-20 flex items-center gap-4">
        {/* Removed harsh filters to display the original fsuu2.png logo beautifully */}
        <div className="flex items-center justify-center border border-white/10 bg-black/30 backdrop-blur-md p-3.5 rounded-2xl shadow-xl">
          <div className="relative w-14 h-14">
            <Image 
              src="/images/fsuu2.png" 
              alt="FSUU Logo" 
              fill
              className="object-contain drop-shadow-md"
            />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-0.5">ComLab Connect FSUU</h1>
          <p className="text-xs text-gray-400 font-medium tracking-wide">Father Saturnino Urios University</p>
        </div>
      </div>

      {/* Main Hero Text (User Friendly & Minimalist) */}
      <div className="relative z-20 mt-auto mb-16 max-w-lg pl-2">
        <h2 className="text-4xl font-light tracking-tight mb-4 leading-normal text-white drop-shadow-sm">
          A smarter way to manage <br />
          <span className="font-semibold text-blue-400">your laboratory.</span>
        </h2>
        <p className="text-lg text-gray-400 font-light leading-relaxed max-w-md">
          Effortlessly book facilities, request equipment, and interact with the campus laboratory network.
        </p>
      </div>

      {/* Bottom Subtle Note */}
      <div className="relative z-20 pl-2">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/5 bg-black/40 backdrop-blur-lg shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></span>
          <p className="text-xs text-gray-300 font-medium tracking-wide">Integrated with Official FSUU Network</p>
        </div>
      </div>
    </div>
  );
}
