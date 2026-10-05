import fitz

pdf_path = r'D:\جداول\جدول_شعبة_علوم_الحاسب_للعام_الدراسي_٢٠٢٧_٢٠٢٦.pdf'
out_path = 'pdf_text_fitz.txt'

doc = fitz.open(pdf_path)
with open(out_path, 'w', encoding='utf-8') as f:
    for i, page in enumerate(doc):
        f.write(f"--- Page {i+1} ---\n")
        f.write(page.get_text("text") + "\n")
print("Done")
