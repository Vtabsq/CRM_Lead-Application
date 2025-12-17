"""
Create a simple app icon for the CRM Lead Form
Requires: pip install pillow
"""
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Installing Pillow...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'pillow'])
    from PIL import Image, ImageDraw, ImageFont

# Create icon sizes
sizes = [16, 32, 48, 64, 128, 256]
icon_images = []

for size in sizes:
    # Create new image with gradient background
    img = Image.new('RGB', (size, size), color='#4F46E5')  # Indigo blue
    draw = ImageDraw.Draw(img)
    
    # Draw a simple design - rounded rectangle
    padding = size // 8
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=size // 6,
        fill='#FFFFFF',
        outline='#4F46E5',
        width=max(1, size // 32)
    )
    
    # Add "CRM" text if size is large enough
    if size >= 64:
        try:
            # Try to use a nice font, fall back to default if not available
            font_size = size // 4
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        text = "CRM"
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Center text
        text_x = (size - text_width) // 2
        text_y = (size - text_height) // 2
        
        draw.text((text_x, text_y), text, fill='#4F46E5', font=font)
    
    icon_images.append(img)

# Save as ICO file (multi-resolution)
icon_path = 'desktop-app/icon.ico'
icon_images[0].save(
    icon_path,
    format='ICO',
    sizes=[(s, s) for s in sizes]
)

print(f"✅ Icon created: {icon_path}")
print(f"📐 Sizes: {', '.join([f'{s}x{s}' for s in sizes])}")
print(f"\n🎨 Icon style: Blue with white 'CRM' text")
print(f"\nYou can replace this with your own icon.ico file later!")
