from app.rag.loader import load_pdf
from app.rag.splitter import split_text
from app.rag.embeddings import add_documents, get_document_count


PDF_PATH = "dsa.pdf"


# 1. Load PDF
text = load_pdf(PDF_PATH)

print("PDF loaded")
print("Characters:", len(text))


# 2. Split text
chunks = split_text(text)

print("Chunks created:", len(chunks))


# 3. Create IDs
ids = [
    f"pdf-{i}"
    for i in range(len(chunks))
]


# 4. Metadata
metadatas = [
    {
        "source": "sample.pdf"
    }
    for _ in chunks
]


# 5. Store in Vector DB
add_documents(
    chunks,
    ids,
    metadatas
)


print(
    "Documents in Vector DB:",
    get_document_count()
)