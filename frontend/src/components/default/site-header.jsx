export default function SiteHeader({
    children,
    below,
    logoText = "MVA",
    logoImage
  }) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2E3192]/20 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          {logoImage ? (
            <img
              src={logoImage}
              alt="Logo"
              className="h-16 w-auto"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#F5D000]/10 text-[16px] text-[#1A1A2E]">
              {logoText}
            </div>
          )}
          {children}
        </div>
        {below}
      </header>
    );
  }