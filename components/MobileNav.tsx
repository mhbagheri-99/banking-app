"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

const MobileNav = ({ user }: MobileNavProps) => {
  const pathname = usePathname();
  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger>
          <Image
            src="/icons/hamburger.svg"
            alt="Open Navigation"
            width={30}
            height={30}
            className="cursor-pointer"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-white">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className="cursor-pointer items-center flex gap-1 px-4"
            >
              <Image
                src="/icons/logo.svg"
                alt="Horizon Logo"
                width={32}
                height={32}
              />
              <h1 className="font-ibm-plex-serif font-bold text-black-1 text-26">
                Horizon
              </h1>
            </Link>
            <div className="mobilenav-sheet">
              <SheetClose asChild>
                <nav className="flex h-full flex-col gap-6 pt-16 text-white">
                  {sidebarLinks.map((link) => {
                    const isActive =
                      pathname === link.route ||
                      pathname.startsWith(`${link.route}/`);
                    return (
                      <SheetClose key={link.route} asChild>
                        <Link
                          href={link.route}
                          key={link.label}
                          className={cn("mobilenav-sheet_close w-full", {
                            "bg-bank-gradient": isActive,
                          })}
                        >
                          <Image
                            src={link.imgURL}
                            alt={link.label}
                            width={20}
                            height={20}
                            className={cn({
                              "brightness-[3] invert-0": isActive,
                            })}
                          />
                          <p
                            className={cn(
                              "text-16 font-semibold text-black-2",
                              {
                                "text-white": isActive,
                              },
                            )}
                          >
                            {link.label}
                          </p>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>
                {/* <PlaidLink user={user} /> */}
              </SheetClose>
              <Footer user={user} type="mobile" />
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
