from app.rag.embeddings import add_documents, get_document_count
from app.rag.retriever import retrieve_documents


# --------------------------------
# 1. Sample documents
# --------------------------------

documents = [
    """
    Binary search is an efficient searching algorithm
    that works on a sorted array.
    Its time complexity is O(log n).
    """,

    """
    A stack is a linear data structure.
    It follows the Last In First Out (LIFO) principle.
    """,

    """
    A queue is a linear data structure.
    It follows the First In First Out (FIFO) principle.
    """
]


# --------------------------------
# 2. IDs for documents
# --------------------------------

ids = [
    "test-1",
    "test-2",
    "test-3"
]


# --------------------------------
# 3. Metadata
# --------------------------------

metadatas = [
    {"topic": "dsa"},
    {"topic": "dsa"},
    {"topic": "dsa"}
]


# --------------------------------
# 4. Add documents to Vector DB
# --------------------------------

print("Adding documents to Vector DB...")

add_documents(
    documents,
    ids,
    metadatas
)


# --------------------------------
# 5. Check number of documents
# --------------------------------

count = get_document_count()

print("\nDocuments in Vector DB:", count)


# --------------------------------
# 6. Search Vector DB
# --------------------------------

query = "What is the time complexity of binary search?"

print("\nSearching for:")
print(query)


result = retrieve_documents(query)


# --------------------------------
# 7. Display retrieved documents
# --------------------------------

print("\nRetrieved documents:")

for document in result["documents"]:

    print("\n--------------------------------")

    print(document)