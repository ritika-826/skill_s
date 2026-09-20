from app.rag.retriever import retrieve_documents
from app.llm.generator import generate_quiz


# --------------------------------
# 1. Search Vector DB
# --------------------------------

query = "Explain the main concepts from this study material."

result = retrieve_documents(
    query,
    n_results=3
)


# --------------------------------
# 2. Combine retrieved documents
# --------------------------------

context = "\n\n".join(
    result["documents"]
)


print("Retrieved context:")
print(context)


# --------------------------------
# 3. Generate quiz
# --------------------------------

questions = generate_quiz(
    context=context,
    topic="Recruitment",
    difficulty="medium",
    number_of_questions=5
)


# --------------------------------
# 4. Display questions
# --------------------------------

print("\n\nAI GENERATED QUIZ\n")


for i, question in enumerate(
    questions,
    start=1
):

    print(f"\nQuestion {i}:")
    print(question["question"])

    for option in question["options"]:
        print("-", option)

    print(
        "Answer:",
        question["correctAnswer"]
    )

    print(
        "Explanation:",
        question["explanation"]
    )