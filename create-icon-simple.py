from PIL import Image, ImageDraw, ImageFont

# Create a 256x256 image
size = 256
img = Image.new('RGB', (size, size), color='#4F46E5')  # Indigo blue
draw = ImageDraw.Draw(img)

# Draw a simple design - rounded rectangle
padding = size // 8
draw.rounded_rectangle(
    [padding, padding, size - padding, size - padding],
    radius=size // 6,
    fill='#FFFFFF',
    outline='#4F46E5',
    width=4
)

# Add "CRM" text
try:
    font = ImageFont.truetype("arial.ttf", 64)
except:
    font = ImageFont.load_default()

text = "CRM"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]

text_x = (size - text_width) // 2
text_y = (size - text_height) // 2

draw.text((text_x, text_y), text, fill='#4F46E5', font=font)

# Save as ICO
icon_path = 'desktop-app/icon.ico'
img.save(icon_path, format='ICO', sizes=[(256, 256)])

print(f"✅ Icon created: {icon_path} (256x256)")
