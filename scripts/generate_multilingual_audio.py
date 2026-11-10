import asyncio
import os
import json
import edge_tts
import mutagen.mp3

BEATS = {
    "en": {
        "voice": "en-US-ChristopherNeural",
        "beats": [
            {
                "id": "beat_01",
                "text": "Right now, half a billion times every single day, this happens: you scan a code, and money moves instantly.",
                "title": "500 Million Times A Day",
                "highlight": "Money Moves Instantly",
                "tag": "[ ARCHIVAL DISPATCH // 001 ]"
            },
            {
                "id": "beat_02",
                "text": "Before this system, every digital swipe went through Visa or Mastercard, pocketing a two to three percent tax.",
                "title": "The 2.5% Card Monopoly",
                "highlight": "Bypassing Card Rails",
                "tag": "[ LEGACY SETTLEMENT RAIL ]"
            },
            {
                "id": "beat_03",
                "text": "Instead of private card rails, an open protocol connects your bank directly to the seller in four hundred milliseconds.",
                "title": "The 400 Millisecond Switch",
                "highlight": "NPCI Direct Protocol",
                "tag": "[ SYSTEM ARCHITECTURE ]"
            },
            {
                "id": "beat_04",
                "text": "Zero transaction fees, instant settlement, and an open infrastructure that the rest of the world is now trying to copy.",
                "title": "The Global Standard",
                "highlight": "Zero Fees Forever",
                "tag": "[ GLOBAL EXPANSION ]"
            }
        ]
    },
    "ta": {
        "voice": "ta-IN-ValluvarNeural",
        "beats": [
            {
                "id": "beat_01",
                "text": "இப்போது, தினமும் ஐம்பது கோடி முறை இது நடக்கிறது: நீங்கள் ஒரு குறியீட்டை ஸ்கேன் செய்கிறீர்கள், பணம் உடனே சென்றுவிடுகிறது.",
                "title": "தினமும் 50 கோடி முறை",
                "highlight": "உடனடி பணப்பரிமாற்றம்",
                "tag": "[ ஆவணப் பதிவு // 001 ]"
            },
            {
                "id": "beat_02",
                "text": "இதற்கு முன்பு, ஒவ்வொரு டிஜிட்டல் பரிவர்த்தனையும் விசா அல்லது மாஸ்டர்கார்டு வழியாகவே இரண்டு சதவீத கட்டணத்துடன் நடந்தது.",
                "title": "அட்டைகளின் கட்டண ஆதிக்கம்",
                "highlight": "2% கட்டணம் தவிர்ப்பு",
                "tag": "[ பழைய கட்டமைப்பு முறை ]"
            },
            {
                "id": "beat_03",
                "text": "தனியார் நிறுவனங்களுக்குப் பதிலாக, NPCI கட்டமைப்பு உங்கள் வங்கியை வெறும் நானூறு மில்லி விநாடிகளில் நேரடியாக இணைக்கிறது.",
                "title": "400 மில்லி விநாடி சுவிட்ச்",
                "highlight": "NPCI நேரடி கட்டமைப்பு",
                "tag": "[ தொழில்நுட்ப கட்டமைப்பு ]"
            },
            {
                "id": "beat_04",
                "text": "கட்டணமில்லா சேவை, உடனடி பரிமாற்றம், மற்றும் உலகம் முழுவதும் இப்போது பின்பற்றத் துடிக்கும் ஒரு திறந்த கட்டமைப்பு.",
                "title": "உலகளாவிய புரட்சி",
                "highlight": "கட்டணமில்லா முறை",
                "tag": "[ உலகளாவிய விரிவாக்கம் ]"
            }
        ]
    },
    "hi": {
        "voice": "hi-IN-MadhurNeural",
        "beats": [
            {
                "id": "beat_01",
                "text": "हर रोज़ 50 करोड़ से ज़्यादा बार ये होता है: आप एक क्यूआर कोड स्कैन करते हैं, और पैसा तुरंत बैंक खाते में पहुँच जाता है।",
                "title": "हर रोज़ 50 करोड़ बार",
                "highlight": "तुरंत बैंक ट्रांसफर",
                "tag": "[ दस्तावेज़ी डिस्पैच // 001 ]"
            },
            {
                "id": "beat_02",
                "text": "इस सिस्टम से पहले, हर डिजिटल पेमेंट वीज़ा या मास्टरकार्ड से होकर गुज़रती थी, जो दो से तीन प्रतिशत तक कमीशन काटते थे।",
                "title": "कार्ड कंपनियों का 2.5% टैक्स",
                "highlight": "कार्ड नेटवर्क को बाईपास",
                "tag": "[ पुराना सेटलमेंट सिस्टम ]"
            },
            {
                "id": "beat_03",
                "text": "प्राइवेट कार्ड नेटवर्क्स के बजाय, NPCI का ओपन प्रोटोकॉल आपके बैंक को सिर्फ़ चार सौ मिलीसेकंड में सीधे सेलर से जोड़ता है।",
                "title": "400 मिलीसेकंड का खेल",
                "highlight": "NPCI डायरेक्ट प्रोटोकॉल",
                "tag": "[ सिस्टम आर्किटेक्चर ]"
            },
            {
                "id": "beat_04",
                "text": "शून्य फ़ीस, तुरंत सेटलमेंट, और एक ऐसा ओपन सिस्टम जिसे अब पूरी दुनिया अपनाने की कोशिश कर रही है।",
                "title": "ग्लोबल क्रांति",
                "highlight": "शून्य ट्रांज़ैक्शन फ़ीस",
                "tag": "[ वैश्विक विस्तार ]"
            }
        ]
    }
}

async def generate_all():
    summary = {}
    for lang, config in BEATS.items():
        summary[lang] = []
        out_dir = os.path.join("public", "audio", lang)
        os.makedirs(out_dir, exist_ok=True)
        
        for beat in config["beats"]:
            audio_path = os.path.join(out_dir, f"{beat['id']}.mp3")
            json_path = os.path.join(out_dir, f"{beat['id']}.json")
            
            print(f"[Generating] {lang.upper()} - {beat['id']} with {config['voice']}...")
            comm = edge_tts.Communicate(beat["text"], config["voice"])
            await comm.save(audio_path)
            
            audio = mutagen.mp3.MP3(audio_path)
            duration_sec = round(audio.info.length, 3)
            duration_frames = int(round(duration_sec * 30))
            
            data = {
                "lang": lang,
                "beat_id": beat["id"],
                "text": beat["text"],
                "title": beat["title"],
                "highlight": beat["highlight"],
                "tag": beat["tag"],
                "audio_file": f"audio/{lang}/{beat['id']}.mp3",
                "duration_seconds": duration_sec,
                "duration_frames": duration_frames
            }
            
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
            summary[lang].append(data)
            print(f" -> {audio_path}: {duration_sec}s ({duration_frames} frames)")
            
    # Save overall multilingual manifest
    with open("public/audio/manifest.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print("\n[SUCCESS] Generated all audio & beat manifests!")

if __name__ == "__main__":
    asyncio.run(generate_all())
