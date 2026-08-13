import { useRef, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

interface AccordionSection {
  id: string;
  title: string;
  content: any;
}

function AccordionItem({
  section,
  isOpen,
  onToggle,
}: {
  section: AccordionSection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      setHeight(isOpen ? el.scrollHeight : 0);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="flex flex-row items-center w-full px-4 py-3 bg-slate-300 border-b border-b-slate-400 transition-colors duration-150 cursor-pointer group"
        onClick={onToggle}
      >
        <div className="flex items-center text-gray-400 group-hover:text-gray-600 transition-colors duration-150">
          <ChevronRight
            className={`w-6 h-6 transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"
              }`}
          />
        </div>
        <span className="font-semibold items-center text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-150">
          {section.title}
        </span>
      </button>

      <div
        style={{
          height,
          overflow: "hidden",
          transition: "height 300ms ease-in-out",
        }}
      >
        <div ref={contentRef} className="px-4 py-3 text-sm text-gray-600">
          {section.content}
        </div>
      </div>
    </div>
  );
}

type AccordionProps =
  | {
    sections: AccordionSection[];
    openId?: never;
    onToggle?: never;
  }
  | {
    sections: AccordionSection[];
    openId: string | null;
    onToggle: (id: string) => void;
  };

function Accordion({ sections, openId, onToggle }: AccordionProps) {
  const [internalOpenId, setInternalOpenId] = useState<string | null>(
    sections[0]?.id ?? null
  );

  const isControlled = openId !== undefined;
  const activeId = isControlled ? openId : internalOpenId;

  function handleToggle(id: string) {
    if (isControlled) {
      onToggle!(id);
    } else {
      setInternalOpenId((prev) => (prev === id ? null : id));
    }
  }

  return (
    <div className="flex flex-col w-full">
      {sections.map((section) => (
        <AccordionItem
          key={section.id}
          section={section}
          isOpen={activeId === section.id}
          onToggle={() => handleToggle(section.id)}
        />
      ))}
    </div>
  );
}

export default Accordion;