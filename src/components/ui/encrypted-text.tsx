import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TARGET_TEXT = "MONTRAQ";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const CHARS = "!@#$%^&*():{};|,.<>/?";

export const EncryptedText = ({
  text = TARGET_TEXT,
  className = "",
}: {
  text?: string;
  className?: string;
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Only animate once on mount
    if (hasAnimated) return;

    let intervalRef: NodeJS.Timeout | null = null;
    let iteration = 0;

    intervalRef = setInterval(() => {
      setDisplayText((currentText) =>
        currentText
          .split("")
          .map((_char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        if (intervalRef) clearInterval(intervalRef);
        setHasAnimated(true);
      }

      iteration += 1 / CYCLES_PER_LETTER;
    }, SHUFFLE_TIME);

    return () => {
      if (intervalRef) clearInterval(intervalRef);
    };
  }, [text, hasAnimated]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {displayText}
    </motion.span>
  );
};
