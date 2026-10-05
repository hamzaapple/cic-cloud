import pdfplumber

pdf_path = r'D:\جداول\جدول_شعبة_علوم_الحاسب_للعام_الدراسي_٢٠٢٧_٢٠٢٦.pdf'
out_path = 'page1.png'

try:
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        im = page.to_image(resolution=150)
        im.save(out_path)
        print("Saved", out_path)
except Exception as e:
    print("Error:", e)
