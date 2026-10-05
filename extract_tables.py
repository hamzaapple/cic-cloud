import pdfplumber
import json
import os

pdf_path = r'D:\جداول\جدول_شعبة_علوم_الحاسب_للعام_الدراسي_٢٠٢٧_٢٠٢٦.pdf'
out_path = 'pdf_text.txt'

with pdfplumber.open(pdf_path) as pdf:
    with open(out_path, 'w', encoding='utf-8') as f:
        for i, page in enumerate(pdf.pages):
            f.write(f"--- Page {i+1} ---\n")
            text = page.extract_text()
            if text:
                f.write(text + "\n")
            
            tables = page.extract_tables()
            for t_idx, table in enumerate(tables):
                f.write(f"Table {t_idx+1}:\n")
                for row in table:
                    f.write(str(row) + "\n")
            f.write("\n")
print("Done")
