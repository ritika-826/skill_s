from app.rag.embeddings import (
    collection,
    model
)


def retrieve_documents(
    query,
    n_results=3
):

    # Convert query into embedding
    query_embedding = model.encode(
        [query]
    ).tolist()

    # Search ChromaDB
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=n_results
    )

    return {
        "documents": results["documents"][0],
        "metadatas": results.get(
            "metadatas",
            [[]]
        )[0]
    }