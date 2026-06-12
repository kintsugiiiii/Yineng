/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface HeaderProps {
  onSearchFocus?: () => void;
  title?: string;
}

export default function Header({ title = '易能' }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#f7fafd]/90 backdrop-blur-md border-b border-[#e5e8eb] transition-all">
      <div className="flex items-center justify-between px-4 h-16 w-full max-w-screen-md mx-auto">
        <div className="flex items-center gap-2 select-none group cursor-pointer">
          <h1 className="text-[22px] font-bold text-[#003ec7] italic font-headline tracking-wide">
            {title}
          </h1>
        </div>
        <button className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#ebeef1] transition-colors active:scale-95 duration-150">
          <span className="material-symbols-outlined text-[#434656] text-2xl">
            notifications
          </span>
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#606200] rounded-full border-2 border-[#f7fafd] animate-pulse"></span>
        </button>
      </div>
    </header>
  );
}
