import os
import json
import asyncio
import shutil
import edge_tts
import mutagen.mp3

scenes_data = [
    {
        "id": 1,
        "kicker": "COLD OPEN",
        "headline": "THE PIGEON POOP THAT HEARD THE BIG BANG",
        "caption": "In 1964, two scientists accidentally heard the birth of our entire universe. But for an entire year... they were convinced it was just warm pigeon shit.",
        "text": "In 1964, two scientists accidentally heard the birth of our entire universe. But for an entire year... they were convinced it was just warm pigeon shit.",
        "portalType": "kinetic_type_slam",
        "image": "images/big_bang_pigeons/holmdel_horn_exterior.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_01.mp3"
    },
    {
        "id": 2,
        "kicker": "CHAPTER I",
        "headline": "THE 50-FOOT ALUMINUM EAR",
        "caption": "Atop Crawford Hill in New Jersey sat the Holmdel Horn Antenna—an 18-ton aluminum giant built to bounce signals off giant orbiting NASA balloons.",
        "text": "Atop Crawford Hill in New Jersey sat the Holmdel Horn Antenna—an 18-ton aluminum giant built to bounce signals off giant orbiting NASA balloons.",
        "portalType": "macro_document",
        "image": "images/big_bang_pigeons/holmdel_horn_exterior.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_02.mp3"
    },
    {
        "id": 3,
        "kicker": "CHAPTER I",
        "headline": "TWO PHYSICISTS AT BELL LABS",
        "caption": "Their names were Arno Penzias and Robert Wilson. With the satellite project completed, they took over the horn for pure radio astronomy.",
        "text": "Their names were Arno Penzias and Robert Wilson. With the satellite project completed, they took over the horn for pure radio astronomy.",
        "portalType": "split_memo",
        "image": "images/big_bang_pigeons/penzias_wilson_horn_antenna.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_03.mp3"
    },
    {
        "id": 4,
        "kicker": "CHAPTER I",
        "headline": "TUNED TO 4,080 MEGAHERTZ",
        "caption": "They chilled their receiver with liquid helium down to four Kelvin and tuned in to 4,080 megahertz, pointing into the quiet halo of the Milky Way.",
        "text": "They chilled their receiver with liquid helium down to four Kelvin and tuned in to 4,080 megahertz, pointing into the quiet halo of the Milky Way.",
        "portalType": "hardware_portal",
        "image": "",
        "audio_file": "audio/big_bang_pigeons/beat_04.mp3"
    },
    {
        "id": 5,
        "kicker": "CHAPTER I",
        "headline": "AN UNEXPLAINED 3.5 KELVIN HUM",
        "caption": "The strip-chart recorder registered an extra 3.5 Kelvin of steady, unyielding static. One hundred times stronger than any expected cosmic signal.",
        "text": "The strip-chart recorder registered an extra 3.5 Kelvin of steady, unyielding static. One hundred times stronger than any expected cosmic signal.",
        "portalType": "hardware_portal",
        "image": "",
        "audio_file": "audio/big_bang_pigeons/beat_05.mp3"
    },
    {
        "id": 6,
        "kicker": "CHAPTER II",
        "headline": "RULE 1: IT IS ALWAYS OUR FAULT",
        "caption": "In physics, you never claim a breakthrough first. You assume your equipment is broken and begin hunting down earthly interference.",
        "text": "In physics, you never claim a breakthrough first. You assume your equipment is broken and begin hunting down earthly interference.",
        "portalType": "kinetic_type_slam",
        "image": "",
        "audio_file": "audio/big_bang_pigeons/beat_06.mp3"
    },
    {
        "id": 7,
        "kicker": "CHAPTER II",
        "headline": "ELIMINATING THE SUSPECTS",
        "caption": "They checked New York City broadcasts, military coastal radars, and even Starfish Prime nuclear fallout. One by one, every suspect was ruled out.",
        "text": "They checked New York City broadcasts, military coastal radars, and even Starfish Prime nuclear fallout. One by one, every suspect was ruled out.",
        "portalType": "suspect_grid",
        "image": "images/big_bang_pigeons/nyc_skyline_1960s.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_07.mp3"
    },
    {
        "id": 8,
        "kicker": "CHAPTER II",
        "headline": "IT WAS COMING FROM EVERYWHERE",
        "caption": "They rotated the giant horn across 360 degrees. The hum was completely isotropic. Identical in day, night, winter, and summer.",
        "text": "They rotated the giant horn across 360 degrees. The hum was completely isotropic. Identical in day, night, winter, and summer.",
        "portalType": "hardware_portal",
        "image": "",
        "audio_file": "audio/big_bang_pigeons/beat_08.mp3"
    },
    {
        "id": 9,
        "kicker": "CHAPTER III",
        "headline": "CRAWLING INTO THE HORN THROAT",
        "caption": "Desperate, Penzias and Wilson put on coveralls and climbed physically inside the aluminum horn to inspect every millimeter of the waveguide.",
        "text": "Desperate, Penzias and Wilson put on coveralls and climbed physically inside the aluminum horn to inspect every millimeter of the waveguide.",
        "portalType": "macro_document",
        "image": "images/big_bang_pigeons/holmdel_horn_interior.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_09.mp3"
    },
    {
        "id": 10,
        "kicker": "CHAPTER III",
        "headline": "WHITE DIELECTRIC MATERIAL",
        "caption": "Deep in the narrow throat, they found two roosting pigeons. And coating the aluminum walls was a layer of warm white dielectric material.",
        "text": "Deep in the narrow throat, they found two roosting pigeons. And coating the aluminum walls was a layer of warm white dielectric material.",
        "portalType": "split_memo",
        "image": "images/big_bang_pigeons/pigeon_cutout.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_10.mp3"
    },
    {
        "id": 11,
        "kicker": "CHAPTER III",
        "headline": "THE HOMING PIGEONS RETURN",
        "caption": "They trapped the pigeons in a box and mailed them sixty miles away. But being homing pigeons, they flew right back into the horn.",
        "text": "They trapped the pigeons in a box and mailed them sixty miles away. But being homing pigeons, they flew right back into the horn.",
        "portalType": "split_memo",
        "image": "images/big_bang_pigeons/homing_pigeon_racing.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_11.mp3"
    },
    {
        "id": 12,
        "kicker": "CHAPTER III",
        "headline": "THE BROOM SCRUB: 3.5K PERSISTS",
        "caption": "The birds were permanently evicted, and the horn was scrubbed with brooms and alcohol. They turned on the receiver: the 3.5 Kelvin hum remained.",
        "text": "The birds were permanently evicted, and the horn was scrubbed with brooms and alcohol. They turned on the receiver: the 3.5 Kelvin hum remained.",
        "portalType": "hardware_portal",
        "image": "",
        "audio_file": "audio/big_bang_pigeons/beat_12.mp3"
    },
    {
        "id": 13,
        "kicker": "CHAPTER IV",
        "headline": "THE PRINCETON THEORISTS",
        "caption": "Thirty miles away at Princeton University, astrophysicist Robert Dicke and Jim Peebles were calculating the death rattle of the early cosmos.",
        "text": "Thirty miles away at Princeton University, astrophysicist Robert Dicke and Jim Peebles were calculating the death rattle of the early cosmos.",
        "portalType": "macro_document",
        "image": "images/big_bang_pigeons/bell_labs_holmdel_building.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_13.mp3"
    },
    {
        "id": 14,
        "kicker": "CHAPTER IV",
        "headline": "THE PRIMORDIAL FIREBALL",
        "caption": "If the Big Bang was true, the searing fireball of creation must have cooled over billions of years into a faint, ubiquitous bath of microwaves.",
        "text": "If the Big Bang was true, the searing fireball of creation must have cooled over billions of years into a faint, ubiquitous bath of microwaves.",
        "portalType": "macro_document",
        "image": "images/big_bang_pigeons/jim_peebles_portrait.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_14.mp3"
    },
    {
        "id": 15,
        "kicker": "CHAPTER IV",
        "headline": "HUNTING THE MICROWAVE GHOST",
        "caption": "Dicke's team was actively constructing a radiometer on the roof of the Princeton physics building, hoping to catch this cosmic glow.",
        "text": "Dicke's team was actively constructing a radiometer on the roof of the Princeton physics building, hoping to catch this cosmic glow.",
        "portalType": "split_memo",
        "image": "images/big_bang_pigeons/robert_dicke_portrait.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_15.mp3"
    },
    {
        "id": 16,
        "kicker": "CHAPTER IV",
        "headline": "WELL BOYS, WE HAVE BEEN SCOOPED",
        "caption": "When Penzias called Dicke to ask about antenna noise, Dicke listened in silence, hung up the phone, and told his colleagues: Boys, we have been scooped.",
        "text": "When Penzias called Dicke to ask about antenna noise, Dicke listened in silence, hung up the phone, and told his colleagues: Boys, we have been scooped.",
        "portalType": "kinetic_type_slam",
        "image": "",
        "audio_file": "audio/big_bang_pigeons/beat_16.mp3"
    },
    {
        "id": 17,
        "kicker": "CHAPTER V",
        "headline": "THE JULY 1965 PACT",
        "caption": "In July 1965, the two teams published companion papers in the Astrophysical Journal, jointly resolving the greatest mystery in cosmology.",
        "text": "In July 1965, the two teams published companion papers in the Astrophysical Journal, jointly resolving the greatest mystery in cosmology.",
        "portalType": "macro_document",
        "image": "images/big_bang_pigeons/holmdel_horn_exterior.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_17.mp3"
    },
    {
        "id": 18,
        "kicker": "CHAPTER V",
        "headline": "TWO PAPERS, ONE TRUTH",
        "caption": "Penzias and Wilson reported the raw numbers with pure understatement. Dicke and Peebles explained what it meant: the echo of the Big Bang.",
        "text": "Penzias and Wilson reported the raw numbers with pure understatement. Dicke and Peebles explained what it meant: the echo of the Big Bang.",
        "portalType": "split_memo",
        "image": "images/big_bang_pigeons/penzias_wilson_horn_antenna.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_18.mp3"
    },
    {
        "id": 19,
        "kicker": "CHAPTER V",
        "headline": "THE STEADY STATE IS DEAD",
        "caption": "The discovery dealt a fatal blow to the Steady State model of the universe. The cosmos had a definite beginning in time.",
        "text": "The discovery dealt a fatal blow to the Steady State model of the universe. The cosmos had a definite beginning in time.",
        "portalType": "kinetic_type_slam",
        "image": "",
        "audio_file": "audio/big_bang_pigeons/beat_19.mp3"
    },
    {
        "id": 20,
        "kicker": "CHAPTER VI",
        "headline": "THE 1978 NOBEL PRIZE",
        "caption": "In 1978, Arno Penzias and Robert Wilson received the Nobel Prize in Physics for discovering the Cosmic Microwave Background.",
        "text": "In 1978, Arno Penzias and Robert Wilson received the Nobel Prize in Physics for discovering the Cosmic Microwave Background.",
        "portalType": "split_memo",
        "image": "images/big_bang_pigeons/nobel_prize_medal_physics.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_20.mp3"
    },
    {
        "id": 21,
        "kicker": "CHAPTER VI",
        "headline": "RECOMBINATION: 380,000 YEARS",
        "caption": "Today satellites like COBE, WMAP, and Planck have mapped this relic radiation across the entire sky with breathtaking fidelity.",
        "text": "Today satellites like COBE, WMAP, and Planck have mapped this relic radiation across the entire sky with breathtaking fidelity.",
        "portalType": "hardware_portal",
        "image": "images/big_bang_pigeons/planck_cmb_allsky_map.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_21.mp3"
    },
    {
        "id": 22,
        "kicker": "CHAPTER VI",
        "headline": "THE SATELLITE LEGACY",
        "caption": "Tiny temperature fluctuations in this glow reveal the primordial seeds that condensed into every galaxy, star, and planet in existence.",
        "text": "Tiny temperature fluctuations in this glow reveal the primordial seeds that condensed into every galaxy, star, and planet in existence.",
        "portalType": "macro_document",
        "image": "images/big_bang_pigeons/cobe_cmb_map.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_22.mp3"
    },
    {
        "id": 23,
        "kicker": "CHAPTER VI",
        "headline": "THE STATIC ON YOUR OLD TV",
        "caption": "If you ever turned an old cathode-ray TV to an empty channel, roughly one percent of that dancing snow was radiation from the Big Bang itself.",
        "text": "If you ever turned an old cathode-ray TV to an empty channel, roughly one percent of that dancing snow was radiation from the Big Bang itself.",
        "portalType": "hardware_portal",
        "image": "",
        "audio_file": "audio/big_bang_pigeons/beat_23.mp3"
    },
    {
        "id": 24,
        "kicker": "CONCLUSION",
        "headline": "THE UNIVERSE WAS WHISPERING",
        "caption": "All it took was two stubborn physicists, an 18-ton aluminum horn, and a refusal to let the pigeons win.",
        "text": "All it took was two stubborn physicists, an 18-ton aluminum horn, and a refusal to let the pigeons win.",
        "portalType": "kinetic_type_slam",
        "image": "images/big_bang_pigeons/penzias_wilson_horn_antenna.jpg",
        "audio_file": "audio/big_bang_pigeons/beat_24.mp3"
    }
]

async def main():
    voice = "en-US-GuyNeural"
    voice_dir = "projects/The_Pigeon_Poop_That_Heard_the_Big_Bang_2026-11-09/03_voiceover"
    pub_audio_dir = "public/audio/big_bang_pigeons"
    os.makedirs(voice_dir, exist_ok=True)
    os.makedirs(pub_audio_dir, exist_ok=True)
    
    current_frame = 0
    scenes_out = []
    
    for s in scenes_data:
        filename = f"beat_{s['id']:02d}.mp3"
        filepath = os.path.join(voice_dir, filename)
        
        print(f"Synthesizing Beat {s['id']} with {voice}...")
        comm = edge_tts.Communicate(s["text"], voice, rate="+7%", pitch="+2Hz")
        await comm.save(filepath)
        shutil.copy2(filepath, os.path.join(pub_audio_dir, filename))
        
        audio = mutagen.mp3.MP3(filepath)
        dur_sec = audio.info.length
        frames = int(round(dur_sec * 30))
        
        # Word-level breakdown
        words_raw = s["text"].split()
        total_chars = sum(len(w) for w in words_raw)
        
        word_objs = []
        w_current_f = 0
        for w in words_raw:
            weight = len(w) + (3 if w.endswith((",", ".", "!", "?", ";", ":")) else 0)
            w_len_f = max(4, int(round((weight / (total_chars + len(words_raw) * 1.5)) * frames)))
            is_key = any(char.isdigit() for char in w) or w.lower() in [
                "pigeon", "shit", "universe", "born", "hum", "kelvin", "4,080",
                "isotropic", "dielectric", "fireball", "scooped", "nobel",
                "static", "bang", "dicke", "wilson", "penzias"
            ]
            word_objs.append({
                "word": w,
                "startFrame": w_current_f,
                "endFrame": min(frames, w_current_f + w_len_f),
                "isKeyWord": is_key
            })
            w_current_f += w_len_f
            
        scene_entry = {
            "id": s["id"],
            "from": current_frame,
            "frames": frames,
            "kicker": s["kicker"],
            "headline": s["headline"],
            "caption": s["caption"],
            "audio_file": f"audio/big_bang_pigeons/{filename}",
            "image": s["image"],
            "portalType": s["portalType"],
            "words": word_objs
        }
        scenes_out.append(scene_entry)
        current_frame += frames
        
    master_data = {
        "project_title": "The Pigeon Poop That Heard the Big Bang",
        "voice": voice,
        "total_duration_frames": current_frame,
        "total_duration_seconds": round(current_frame / 30, 2),
        "scenes": scenes_out
    }
    
    with open("src/data/big_bang_pigeons_scenes.json", "w", encoding="utf-8") as f:
        json.dump(master_data, f, indent=2)
    print(f"Done! Generated {len(scenes_out)} scenes! Total frames: {current_frame} ({master_data['total_duration_seconds']}s)")

if __name__ == "__main__":
    asyncio.run(main())
