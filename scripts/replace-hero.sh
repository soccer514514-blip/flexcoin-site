#!/usr/bin/env bash
SRC=${1:-./NewHero}
DST=${2:-./public/hero}
mkdir -p "$DST"; i=1; for f in $(ls -1 "$SRC" | egrep -i '\.(jpg|jpeg|png)$' | head -7); do cp "$SRC/$f" "$DST/$i.jpg"; i=$((i+1)); done; cp "$DST/1.jpg" "$DST/main-hero.jpg"
