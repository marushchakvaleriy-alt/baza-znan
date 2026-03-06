import fitz  # PyMuPDF
import sys
import os

if len(sys.argv) < 2:
    print("Помилка: Не вказано шлях до PDF-файлу.")
    print("Використання: python extract_pdf.py \"ШЛЯХ_ДО_ВАШОГО_ФАЙЛУ.pdf\"")
    sys.exit(1)

pdf_path = sys.argv[1]

if not os.path.exists(pdf_path):
    print(f"Помилка: Файл {pdf_path} не знайдено.")
    sys.exit(1)

# Базова папка для збереження (витягуємо ім'я файлу без розширення)
base_name = os.path.splitext(os.path.basename(pdf_path))[0]
output_base_dir = r"c:\Users\v_marushchak\Desktop\помічник розрахунків\наповненя\виконано"
output_dir = os.path.join(output_base_dir, base_name, "images")

os.makedirs(output_dir, exist_ok=True)

print(f"Обробка файлу: {pdf_path}...")

# Відкриваємо PDF
doc = fitz.open(pdf_path)

text_content = ""

for page_index in range(len(doc)):
    page = doc[page_index]
    text_content += f"\n--- Сторінка {page_index + 1} ---\n\n"
    text_content += page.get_text()
    
    # Отримуємо всі зображення на сторінці
    image_list = page.get_images(full=True)
    
    for image_index, img in enumerate(image_list, start=1):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        
        # Формуємо ім'я файлу (наприклад: page_1_img_1.png)
        image_filename = os.path.join(output_dir, f"page_{page_index + 1}_img_{image_index}.{image_ext}")
        
        with open(image_filename, "wb") as f:
            f.write(image_bytes)

# Зберігаємо весь витягнутий текст
text_path = os.path.join(output_base_dir, base_name, f"{base_name}_text.txt")
with open(text_path, "w", encoding="utf-8") as f:
    f.write(text_content)

print(f"Успіх! Текст збережено у {text_path}")
print(f"Картинки збережено у папку {output_dir}")
