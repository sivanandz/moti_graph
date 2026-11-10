import urllib.request
import os
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

# Free Unsplash / Wikimedia high-res archival assets:
IMAGES = {
    "vintage_paper_texture.jpg": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&q=80",
    "bank_vault_doors.jpg": "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=1080&q=80",
    "antique_map.jpg": "https://images.unsplash.com/photo-1524654458049-e36be0721fa2?w=1080&q=80",
    "credit_card_monopoly.jpg": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1080&q=80"
}

out_dir = os.path.join("public", "images")
os.makedirs(out_dir, exist_ok=True)

for name, url in IMAGES.items():
    dest = os.path.join(out_dir, name)
    print(f"Downloading {name}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp, open(dest, "wb") as f:
            f.write(resp.read())
        print(f" -> Saved {dest} ({os.path.getsize(dest)} bytes)")
    except Exception as e:
        print(f" -> Failed {name}: {e}")
