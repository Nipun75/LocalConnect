export const DynamicSupportingText = () => {
  const typographyClass = "text-[28px] sm:text-[34px] md:text-[42px] lg:text-[50px] text-foreground font-semibold leading-tight tracking-tight flex flex-wrap justify-center gap-[0.25em]";
  const sansStyle = { fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' };
  
  return (
    <div className="w-full mb-6 mx-auto flex items-center justify-center">
      <h2 className={typographyClass}>
        <span style={sansStyle}>Find</span>
        <span style={sansStyle} className="text-primary">local.</span>
        <span className="font-serif italic pr-[0.05em] text-primary">Connect</span>
        <span style={sansStyle}>better.</span>
      </h2>
    </div>
  );
};
