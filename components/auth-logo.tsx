const AuthLogo = () => (
  <div className="flex flex-col items-center gap-1">
    <img
      src="/logo-ixoye.webp"
      alt="Refacciones Ixoye"
      width={397}
      height={192}
      className="h-14 md:h-16 w-auto object-contain"
    />
    <span className="text-[#003366] dark:text-sky-300 font-black text-sm uppercase italic tracking-wide">
      Refacciones
    </span>
  </div>
);

export default AuthLogo;
