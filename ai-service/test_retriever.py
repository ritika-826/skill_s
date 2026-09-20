from app.rag.retriever import retrieve_documents


query = "What is the time complexity of binary search?"

result = retrieve_documents(
    query,
    n_results=3
)

print("\nRetrieved Documents:\n")

for i, document in enumerate(result["documents"], start=1):
    print("=" * 60)
    print(f"Document {i}")
    print("=" * 60)
    print(document)
    print()