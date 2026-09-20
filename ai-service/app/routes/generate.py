from fastapi import APIRouter, HTTPException
from app.llm.generator import generate_quiz
from app.rag.retriever import retrieve_documents

router = APIRouter()

@router.post("/generate")
def generate_quiz_api(data: dict):
    try:
        role = data.get("role", "Software Engineer")
        topic = data.get("topic")
        topics = data.get("topics")
        difficulty = data.get("difficulty", "medium")
        number_of_questions = data.get("numberOfQuestions", 5)

        # Topic fallback
        if not topic and isinstance(topics, list) and len(topics) > 0:
            topic = topics[0]

        if not topic:
            topic = "General Technical"

        # 1. Retrieve relevant documents via RAG (query: "Role Topic")
        search_query = f"{role} {topic}"
        documents = []
        try:
            result = retrieve_documents(search_query, n_results=3)
            documents = result.get("documents", [])
        except Exception as e:
            print(f"RAG Retrieval Notice (proceeding with fallback): {e}")

        context = "\n\n".join(documents) if documents else ""

        # 2. Generate quiz using LLM
        questions = generate_quiz(
            context=context,
            topic=topic,
            role=role,
            difficulty=difficulty,
            number_of_questions=number_of_questions
        )

        return {
            "message": "Quiz generated successfully",
            "role": role,
            "topic": topic,
            "difficulty": difficulty,
            "numberOfQuestions": len(questions),
            "questions": questions
        }

    except HTTPException:
        raise
    except Exception as error:
        print("AI GENERATION ERROR:", error)
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )