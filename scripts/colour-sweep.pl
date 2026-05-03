#!/usr/bin/env perl
# One-off: collapse the entire codebase to the 5-colour palette.
#   #1a1a1a background · #222222 cards/borders · #2e2e2e elevated
#   #ffffff text+accents · #C9C9C9 secondary text
# Run from repo root: find app lib -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.css' -o -name '*.mjs' -o -name '*.js' -o -name '*.backup' -o -name '*.bak' \) -print0 | xargs -0 perl -i scripts/colour-sweep.pl
use strict;
use warnings;

while (<>) {
  # ---- Hex codes (longest first; \b prevents prefix collisions) ----

  # Background tones
  s/#1a1a1a\b/#1a1a1a/gi;
  s/#1a1a2e\b/#1a1a1a/gi;
  s/#0a0f1a\b/#1a1a1a/gi;

  # Card surfaces (6-char)
  s/#0d0d0d\b/#222222/gi;
  s/#0f1d0f\b/#222222/gi;
  s/#1d0f0f\b/#222222/gi;
  s/#222222\b/#222222/gi;
  s/#2a2a2a\b/#222222/gi;
  s/#2a4a2a\b/#222222/gi;
  s/#4a2a2a\b/#222222/gi;
  s/#2e2e2e\b/#222222/gi;
  s/#0c3a6e\b/#222222/gi;
  # Card surfaces (3-char)
  s/#222\b/#222222/gi;
  s/#111\b/#222222/gi;

  # Elevated surfaces (6-char)
  s/#333333\b/#2e2e2e/gi;
  s/#555555\b/#2e2e2e/gi;
  s/#383838\b/#2e2e2e/gi;
  s/#326760\b/#2e2e2e/gi;
  s/#7697a2\b/#2e2e2e/gi;
  # Elevated (3-char)
  s/#333\b/#2e2e2e/gi;
  s/#555\b/#2e2e2e/gi;

  # Secondary text (greys, tinted greys, faded reds)
  s/#9a9a9a\b/#C9C9C9/gi;
  s/#bbbbbb\b/#C9C9C9/gi;
  s/#dddddd\b/#C9C9C9/gi;
  s/#cccccc\b/#C9C9C9/gi;
  s/#c9c9c9\b/#C9C9C9/gi;
  s/#cfe7c9\b/#C9C9C9/gi;
  s/#e7c9c9\b/#C9C9C9/gi;
  s/#e07b7b\b/#C9C9C9/gi;
  s/#8a3a3a\b/#C9C9C9/gi;
  s/#666\b/#C9C9C9/gi;
  s/#777\b/#C9C9C9/gi;
  s/#aaa\b/#C9C9C9/gi;

  # Accent colours (greens, blues, yellows, oranges, reds) → white
  s/#02a95b\b/#ffffff/gi;
  s/#2aa82c\b/#ffffff/gi;
  s/#4a8a3a\b/#ffffff/gi;
  s/#7ec973\b/#ffffff/gi;
  s/#0087dc\b/#ffffff/gi;
  s/#48a5ee\b/#ffffff/gi;
  s/#12b6cf\b/#ffffff/gi;
  s/#005b54\b/#ffffff/gi;
  s/#fff200\b/#ffffff/gi;
  s/#f6cb2f\b/#ffffff/gi;
  s/#faa61a\b/#ffffff/gi;
  s/#d46a4c\b/#ffffff/gi;
  s/#d50000\b/#ffffff/gi;
  s/#8b0000\b/#ffffff/gi;

  # Black → background dark (no pure black in palette)
  s/#000000\b/#1a1a1a/gi;
  s/#000\b/#1a1a1a/gi;

  # Normalize #fff shorthand to full (after all 6-char #fffXXX handled above)
  s/#fff\b/#ffffff/gi;

  # ---- Tailwind named colour classes ----
  # text-black is on white backgrounds (buttons/badges); flip to deep teal
  s/\btext-black\b/text-[#1a1a1a]/g;
  s/\bbg-black\/40\b/bg-[#1a1a1a]\/40/g;
  s/\bbg-black\b/bg-[#1a1a1a]/g;

  # Legacy blues (in .backup) → primary white / elevated
  s/\bbg-blue-(?:500|600|700)\b/bg-white/g;
  s/\btext-blue-(?:300|400|500|600)\b/text-white/g;
  s/\bborder-blue-(?:400|500|600)\b/border-white/g;
  s/\bhover:bg-blue-(?:500|600|700|800)\b/hover:bg-[#C9C9C9]/g;

  # Legacy greys → secondary text / card border
  s/\btext-gray-(?:200|300|400|500)\b/text-[#C9C9C9]/g;
  s/\btext-gray-(?:600|700|800|900)\b/text-[#1a1a1a]/g;
  s/\bbg-gray-(?:100|200|300)\b/bg-[#C9C9C9]/g;
  s/\bbg-gray-(?:700|800|900)\b/bg-[#222222]/g;
  s/\bborder-gray-(?:600|700|800|900)(\/[0-9]+)?\b/border-[#222222]$1/g;
  s/\bborder-gray-(?:100|200|300|400|500)(\/[0-9]+)?\b/border-[#2e2e2e]$1/g;

  print;
}
