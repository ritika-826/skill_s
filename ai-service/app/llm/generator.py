import os
import json
import re

from dotenv import load_dotenv
from groq import Groq


# =====================================================
# LOAD ENVIRONMENT VARIABLES
# =====================================================

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is missing from .env")


# =====================================================
# GROQ CLIENT
# =====================================================

client = Groq(api_key=api_key)


# =====================================================
# GENERATE QUIZ
# =====================================================

def generate_quiz(
    context,
    topic,
    role="Software Engineer",
    difficulty="medium",
    number_of_questions=5
):
    """
    Generate MCQ questions using RAG context and Role/Topic constraints.
    """

    # -------------------------------------------------
    # CLEAN INPUT
    # -------------------------------------------------

    context = context or ""
    topic = topic or "general"
    role = role or "Software Engineer"

    try:
        number_of_questions = int(number_of_questions)
    except (ValueError, TypeError):
        number_of_questions = 5

    if number_of_questions <= 0:
        number_of_questions = 5

    # Prevent extremely large prompts
    context = context[:12000]


    # =================================================
    # PROMPT
    # =================================================

    prompt = f"""
You are an expert technical assessment creator for online skill evaluations.

Generate EXACTLY {number_of_questions} multiple-choice questions specifically designed for:

JOB ROLE:
{role}

TOPIC / SKILL:
{topic}

DIFFICULTY LEVEL:
{difficulty}

=====================================================
CRITICAL RELEVANCE RULES
=====================================================

1. The questions MUST be 100% relevant to the role "{role}" and the specific topic "{topic}".
2. DO NOT ask generic Data Structures & Algorithms (DSA) or LeetCode questions unless the role is Backend Developer/Software Engineer and the topic is explicitly DSA.
3. For DevOps Engineer, ask about Docker, Kubernetes, CI/CD, Linux, Cloud, Jenkins, etc.
4. For Data Analyst, ask about SQL, Data Visualization, Excel, Pandas, Statistics, etc.
5. Every question must feel like a real technical assessment question on HackerRank.

=====================================================
IMPORTANT STRUCTURAL RULES
=====================================================

1. Generate EXACTLY {number_of_questions} questions.
2. Every question must contain exactly 4 options.
3. Every option must be unique.
4. "correctAnswer" MUST exactly match one of the four options.
5. Distractors must be plausible, realistic technical choices.
6. Provide a clear, educational explanation for the correct answer.
7. Return ONLY valid JSON array with NO markdown syntax, commentary, or wrapper text.

=====================================================
STUDY / RAG MATERIAL (PRIMARY REFERENCE IF APPLICABLE)
=====================================================

{context}

=====================================================
OUTPUT FORMAT
=====================================================

[
  {{
    "question": "Which Docker command is used to list running containers?",
    "options": [
      "docker images",
      "docker ps",
      "docker run",
      "docker start"
    ],
    "correctAnswer": "docker ps",
    "explanation": "docker ps lists currently running Docker containers."
  }}
]
"""

    # =================================================
    # CALL GROQ
    # =================================================

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a skill-specific technical assessment generator. "
                        "Return ONLY valid JSON array."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )
    except Exception as error:
        print("\n==============================")
        print("GROQ API ERROR")
        print("==============================")
        print(error)
        return []

    # =================================================
    # GET AI RESPONSE
    # =================================================

    try:
        content = response.choices[0].message.content
    except Exception as error:
        print("Could not read AI response:", error)
        return []

    if not content:
        print("AI returned an empty response.")
        return []

    content = content.strip()

    # =================================================
    # REMOVE MARKDOWN CODE FENCES
    # =================================================

    content = re.sub(r"^```json\s*", "", content, flags=re.IGNORECASE)
    content = re.sub(r"^```\s*", "", content)
    content = re.sub(r"\s*```$", "", content)
    content = content.strip()

    # =================================================
    # PARSE JSON
    # =================================================

    questions = None
    try:
        questions = json.loads(content)
    except json.JSONDecodeError:
        print("\nAI returned invalid JSON. Trying to recover JSON array...")
        try:
            start = content.find("[")
            end = content.rfind("]")
            if start != -1 and end != -1:
                json_content = content[start:end + 1]
                questions = json.loads(json_content)
            else:
                print("No JSON array found.")
                return []
        except json.JSONDecodeError:
            print("\nCould not recover JSON.")
            print(content)
            return []

    if not isinstance(questions, list):
        print("AI response is not a JSON list.")
        return []

    # =================================================
    # VALIDATE & DEDUPLICATE QUESTIONS
    # =================================================

    valid_questions = []
    seen_question_texts = set()

    for index, question in enumerate(questions):
        if not isinstance(question, dict):
            continue

        question_text = question.get("question")
        options = question.get("options")
        correct_answer = question.get("correctAnswer")
        explanation = question.get("explanation", "")

        if not isinstance(question_text, str) or not question_text.strip():
            continue

        # Clean normalized question text for duplicate check
        normalized_q_text = re.sub(r'[\W_]+', '', question_text.strip().lower())
        if normalized_q_text in seen_question_texts:
            print(f"Skipping duplicate question: {question_text[:30]}...")
            continue

        if not isinstance(options, list) or len(options) != 4:
            continue

        if not all(isinstance(opt, str) for opt in options):
            continue

        normalized_options = [opt.strip().lower() for opt in options]
        if len(set(normalized_options)) != 4:
            continue

        if not isinstance(correct_answer, str) or not correct_answer.strip():
            continue

        if correct_answer.strip().lower() not in normalized_options:
            continue

        correct_index = normalized_options.index(correct_answer.strip().lower())
        correct_answer = options[correct_index]

        if not isinstance(explanation, str):
            explanation = str(explanation)

        seen_question_texts.add(normalized_q_text)

        valid_questions.append({
            "question": question_text.strip(),
            "options": [opt.strip() for opt in options],
            "correctAnswer": correct_answer.strip(),
            "explanation": explanation.strip(),
            "topic": topic,
            "difficulty": difficulty
        })

    valid_questions = valid_questions[:number_of_questions]

    print(f"\nGenerated {len(valid_questions)} valid questions for Role: {role}, Topic: {topic}.")
    return valid_questions