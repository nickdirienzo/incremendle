#!/usr/bin/env python3
"""Build tools/subjects.json, the roller's subject nouns, from Unicode's emoji list.

    python3 tools/emoji.py               fetch the latest emoji-test.txt and append new emoji
    python3 tools/emoji.py emoji-test.txt   use a local copy

Emoji names are a big list nobody wrote for us, so they don't lean the way a list an LLM
writes does (three lighthouses in sixty subjects). Only things that can be a character are
kept: animals, plants, food, places, vehicles, weather, objects, activities and a few
fantasy and job people, gender-neutral, with no skin tones. Like the lists in roll.py the file
is append-only: existing entries keep their order (a seed rolls the same), new Unicode
versions add to the end, and entries dropped from SKIP stay dropped by being removed by hand.
"""
import json
import sys
import urllib.request
from pathlib import Path

URL = "https://unicode.org/Public/emoji/latest/emoji-test.txt"
OUT = Path(__file__).resolve().parent / "subjects.json"

GROUPS = {"Animals & Nature", "Food & Drink", "Travel & Places", "Activities", "Objects"}
SUBGROUPS = {"face-costume", "person-role", "person-fantasy"}  # from the other groups
SKIP_SUBGROUPS = {"place-map", "place-religious", "time", "award-medal"}
# Faces, near-duplicates, real places, religious dress and things that don't suit a cute game.
SKIP = {
    "pile of poo", "smiling face with horns", "angry face with horns", "skull", "skull and crossbones",
    "person wearing turban", "person with skullcap", "person with headscarf", "pregnant person",
    "pregnant man", "pregnant woman", "breast-feeding", "person feeding baby", "person with veil",
    "person in tuxedo", "Mx Claus", "Mrs. Claus", "police officer", "guard",
    "Statue of Liberty", "Tokyo tower", "Mount Fuji", "Japanese castle", "Japanese post office",
    "moai", "wedding", "stadium", "classical building", "house with garden", "houses",
    "derelict house", "office building", "hospital", "bank", "love hotel", "convenience store",
    "department store", "factory", "post office", "school",
    "cigarette", "bomb", "pistol", "dagger", "crossed swords", "syringe", "drop of blood",
    "coffin", "funeral urn", "headstone", "prayer beads", "military helmet", "kitchen knife",
    "bow and arrow", "shield", "wine glass", "cocktail glass", "tropical drink", "beer mug",
    "clinking beer mugs", "clinking glasses", "tumbler glass", "bottle with popping cork",
    "sake", "middle finger", "rifle", "axe", "carpentry saw",
    "new moon face", "first quarter moon face", "last quarter moon face", "full moon face",
    "sun with face", "waxing crescent moon", "waxing gibbous moon", "waning gibbous moon",
    "waning crescent moon", "first quarter moon", "last quarter moon", "new moon",
    "sun behind small cloud", "sun behind large cloud", "sun behind rain cloud",
    "cloud with lightning and rain", "cloud with snow", "cloud with rain", "cloud with lightning",
    "umbrella with rain drops", "umbrella on ground", "high voltage", "droplet",
    "high-speed train", "bullet train", "train", "light rail", "station", "monorail",
    "mountain railway", "railway car", "oncoming bus", "oncoming police car", "oncoming automobile",
    "oncoming taxi", "police car", "police car light", "motorway", "railway track",
    "fuel pump", "vertical traffic light", "horizontal traffic light", "stop sign",
    "airplane departure", "airplane arrival", "pager", "fax machine", "telephone receiver",
    "mobile phone with arrow", "computer disk", "optical disk", "dvd", "minidisc",
    "joystick", "page facing up", "page with curl", "bookmark tabs", "card index",
    "spiral notepad", "spiral calendar", "tear-off calendar", "calendar", "card index dividers",
    "file folder", "open file folder", "file cabinet", "linked paperclips", "chart increasing",
    "chart decreasing", "bar chart", "chart increasing with yen", "yen banknote", "euro banknote",
    "pound banknote", "dollar banknote", "money with wings", "receipt", "credit card",
    "locked with pen", "locked with key", "closed lock with key", "old key", "fleur-de-lis",
    "mount fuji", "merman", "mermaid", "pig nose", "front-facing baby chick", "two-hump camel",
    "snowman without snow", "tram car", "muted speaker", "speaker low volume",
    "speaker medium volume", "speaker high volume", "bell with slash", "low battery", "e-mail",
    "incoming envelope", "envelope with arrow", "closed mailbox with lowered flag",
    "open mailbox with raised flag", "open mailbox with lowered flag", "green book", "blue book",
    "orange book", "magnifying glass tilted right", "reminder ribbon", "ballot box with ballot",
    "nazar amulet", "hamsa", "diya lamp", "woman’s clothes", "woman’s hat", "woman’s sandal",
    "woman’s boot", "man’s shoe", "briefs", "bikini", "cityscape at dusk", "sunrise over mountains",
    "camera with flash", "hammer and pick", "hammer and wrench", "round pushpin", "foggy",
}


def parse(text):
    group = subgroup = None
    for line in text.splitlines():
        if line.startswith("# group:"):
            group = line.split(":", 1)[1].strip()
        elif line.startswith("# subgroup:"):
            subgroup = line.split(":", 1)[1].strip()
        elif line and not line.startswith("#") and "; fully-qualified" in line:
            emoji, rest = line.split("#", 1)[1].strip().split(" ", 1)
            name = rest.split(" ", 1)[1].strip()  # drop the "E15.0" version
            yield group, subgroup, emoji, name


def keep(group, subgroup, name, names):
    if name.endswith(" face") and name[:-5] in names:  # "dog face" beside "dog"
        return False
    if subgroup in SKIP_SUBGROUPS or name in SKIP or ":" in name:
        return False
    if group in ("People & Body", "Smileys & Emotion"):
        return subgroup in SUBGROUPS and not name.startswith(("man ", "woman ", "men ", "women "))
    return group in GROUPS


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else None
    text = Path(src).read_text() if src else urllib.request.urlopen(URL).read().decode()
    have = json.loads(OUT.read_text()) if OUT.exists() else []
    seen = {e["emoji"] for e in have}
    rows = list(parse(text))
    names = {n for _, _, _, n in rows}
    new = [{"emoji": e, "name": n, "subgroup": s}
           for g, s, e, n in rows if keep(g, s, n, names) and e not in seen]
    OUT.write_text("[\n" + ",\n".join(json.dumps(e, ensure_ascii=False) for e in have + new) + "\n]\n")
    print(f"{len(have)} kept, {len(new)} added, {len(have) + len(new)} subjects in {OUT.name}")


if __name__ == "__main__":
    main()
