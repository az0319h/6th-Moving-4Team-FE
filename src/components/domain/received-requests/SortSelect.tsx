"use client";

import { useRef, useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { useOutsideClick } from "@/lib/hooks/useOutsideClick";
interface Option {
   label: string;
   value: string;
}

interface SortSelectProps {
   value: string;
   onChange: (value: string) => void;
   options: Option[];
}

export default function SortSelect({
   value,
   onChange,
   options,
}: SortSelectProps) {
   const [open, setOpen] = useState(false);
   const wrapperRef = useRef<HTMLDivElement | null>(null);

   const selectedLabel =
      options.find((opt) => opt.value === value)?.label || "";

   useOutsideClick(wrapperRef, () => setOpen(false));

   return (
      <div ref={wrapperRef} className="relative z-10 inline-block w-fit">
         <div
            onClick={() => setOpen((prev) => !prev)}
            className="flex cursor-pointer items-center justify-between"
         >
            <span className="text-14-medium lg:text-16-medium">
               {selectedLabel}
            </span>
            <span
               className={`transition-transform duration-300 ${
                  open ? "rotate-180" : ""
               }`}
            >
               <RiArrowDropDownLine size={24} />
            </span>
         </div>

         <AnimatePresence>
            {open && (
               <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="text-14-medium lg:text-16-medium absolute left-0 mt-2 w-full overflow-hidden rounded-lg border border-gray-100 bg-white"
               >
                  {options.map(({ label, value: val }) => (
                     <li key={val}>
                        <button
                           onClick={() => {
                              onChange(val);
                              setOpen(false);
                           }}
                           className={`w-full px-2.5 py-2 text-nowrap hover:bg-gray-100 ${
                              val === value ? "" : ""
                           }`}
                        >
                           {label}
                        </button>
                     </li>
                  ))}
               </motion.ul>
            )}
         </AnimatePresence>
      </div>
   );
}
