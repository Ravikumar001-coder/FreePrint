from PIL import Image

def remove_white_background(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()
    
    newData = []
    # threshold for white
    threshold = 230
    for item in datas:
        # Check if the pixel is near white
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            newData.append((255, 255, 255, 0)) # Transparent
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")

remove_white_background(r"C:\Users\ravi kumar\.gemini\antigravity-ide\brain\4f1455b4-baed-43c2-b560-94145ac2bccd\media__1782665481967.png", r"c:\Users\ravi kumar\Desktop\pdf-imposer-and-note-optimizer\public\watermark.png")
print("Saved watermark.png to public directory.")
