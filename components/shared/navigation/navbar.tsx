"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Home, Calendar, Monitor, Search, AlertCircle, FileText, Users, Settings, Server, Activity, Database, ClipboardList, PackageCheck, Wrench, Bot, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Role = 'student' | 'teacher' | 'sa' | 'admin';

interface NavbarProps {
  role: Role;
}

export function Navbar({ role }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Return the correct navigation links based on user role
  const getLinks = (userRole: Role) => {
    switch(userRole) {
      case 'student':
        return [
          { name: "Dashboard", href: "/student", icon: Home },
          { name: "Equipment Hub", href: "#", icon: Monitor },
          { name: "Lost & Found", href: "#", icon: Search },
          { name: "Live Lab Status", href: "#", icon: Activity },
        ];
      case 'teacher':
        return [
          { name: "Class Dashboard", href: "/teacher", icon: Home },
          { name: "Global Schedule", href: "#", icon: Calendar },
          { name: "Incident Reporting", href: "#", icon: AlertCircle },
          { name: "Software Requests", href: "#", icon: FileText },
          { name: "Staffing Directory", href: "#", icon: Users },
        ];
      case 'sa':
        return [
          { name: "SA Dashboard", href: "/sa", icon: Home },
          { name: "Booking Reviewer", href: "#", icon: Calendar },
          { name: "Inventory Monitor", href: "#", icon: PackageCheck },
          { name: "Lost & Found Manager", href: "#", icon: Search },
          { name: "Ticketing System", href: "#", icon: ClipboardList },
          { name: "Occupancy Monitor", href: "#", icon: Activity },
        ];
      case 'admin':
        return [
          { name: "Admin Dashboard", href: "/admin", icon: Home },
          { name: "User Management", href: "#", icon: Users },
          { name: "Lab Infrastructure", href: "#", icon: Server },
          { name: "Master Inventory", href: "#", icon: Database },
          { name: "System Analytics", href: "#", icon: Activity },
          { name: "Audit Logs", href: "#", icon: FileText },
        ];
      default:
        return [];
    }
  };

  const links = getLinks(role);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="flex h-16 items-center px-6 lg:px-8 max-w-screen-2xl mx-auto justify-between w-full">
        
        {/* Logo Section */}
        <Link href={`/${role}`} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Bot className="h-7 w-7 text-[#164ac9]" />
          <span className="font-bold text-lg text-[#164ac9] hidden sm:inline-block tracking-tight">ComLab Connect</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-[#164ac9]"
            >
              {link.name}
            </Link>
          ))}
          <div className="pl-6 border-l ml-2">
            <Button variant="ghost" className="text-muted-foreground hover:text-red-600 gap-2 font-semibold" asChild>
              <Link href="/">
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </Button>
          </div>
        </nav>

        {/* Mobile Hamburger Navigation (Sheet) */}
        <div className="lg:hidden flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle mobile menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent side="right" className="w-[300px] sm:w-[350px] pt-12">
              <SheetHeader className="text-left mb-8">
                <SheetTitle className="text-xl font-bold flex items-center gap-2 text-[#164ac9]">
                  <Bot className="h-6 w-6" /> Menu
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 text-md font-semibold text-gray-600 transition-colors p-3 hover:bg-gray-100 hover:text-[#164ac9] rounded-lg"
                    >
                      <Icon className="h-5 w-5 opacity-70" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              <div className="absolute bottom-8 left-6 right-6 pt-6 border-t">
                <Button variant="destructive" className="w-full gap-2 font-bold" onClick={() => setIsOpen(false)} asChild>
                  <Link href="/">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
