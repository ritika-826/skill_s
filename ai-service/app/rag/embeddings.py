import chromadb
from sentence_transformers import SentenceTransformer


# -----------------------------------------
# Embedding model
# -----------------------------------------

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# -----------------------------------------
# ChromaDB
# -----------------------------------------

client = chromadb.PersistentClient(
    path="./chroma_db"
)


collection = client.get_or_create_collection(
    name="study_material"
)


# -----------------------------------------
# Add documents
# -----------------------------------------

def add_documents(
    documents,
    ids,
    metadatas=None
):

    embeddings = model.encode(
        documents
    ).tolist()

    collection.add(
        documents=documents,
        embeddings=embeddings,
        ids=ids,
        metadatas=metadatas
    )


# -----------------------------------------
# Number of documents
# -----------------------------------------

def get_document_count():

    return collection.count()