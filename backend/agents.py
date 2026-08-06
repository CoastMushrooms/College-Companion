import json
from ai import client, MODEL, summarize_notes, explain_concept, generate_quiz
from rag import query_documents

AGENT_TYPES = ["tutor", "planner", "research", "quiz", "writing", "career"]

def classify_intent(message: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": (
                    "Classify the following student request into exactly one category: "
                    f"{', '.join(AGENT_TYPES)}.\n\n"
                    "tutor = explaining a concept\n"
                    "planner = scheduling, study plans, deadlines\n"
                    "research = questions about uploaded documents/notes\n"
                    "quiz = requesting practice questions or a quiz\n"
                    "writing = reviewing or improving written text (essays, emails)\n"
                    "career = internships, jobs, career advice\n\n"
                    "Respond with ONLY the category name, nothing else.\n\n"
                    f"Request: {message}"
                )
            }
        ]
    )
    category = response.choices[0].message.content.strip().lower()
    return category if category in AGENT_TYPES else "tutor"

def tutor_agent(message: str) -> str:
    return explain_concept(message, style="student")

def planner_agent(message: str, assignments_context: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": (
                    f"You are a study planning assistant. The student's current assignments:\n"
                    f"{assignments_context}\n\n"
                    f"Student request: {message}"
                )
            }
        ]
    )
    return response.choices[0].message.content

def research_agent(message: str, user_id: int) -> dict:
    return query_documents(message, user_id)

def quiz_agent(message: str) -> list:
    return generate_quiz(message)

def writing_agent(message: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": (
                    "You are a writing tutor. Review the following text for clarity, grammar, "
                    "and structure. Give specific, actionable feedback.\n\n"
                    f"{message}"
                )
            }
        ]
    )
    return response.choices[0].message.content

def career_agent(message: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": (
                    "You are a career advisor for college students. Give practical, encouraging "
                    f"advice for the following question:\n\n{message}"
                )
            }
        ]
    )
    return response.choices[0].message.content

def route_to_agent(message: str, user_id: int, assignments_context: str = "") -> dict:
    intent = classify_intent(message)

    if intent == "tutor":
        result = tutor_agent(message)
    elif intent == "planner":
        result = planner_agent(message, assignments_context)
    elif intent == "research":
        research_result = research_agent(message, user_id)
        result = research_result["answer"]
    elif intent == "quiz":
        result = quiz_agent(message)
    elif intent == "writing":
        result = writing_agent(message)
    elif intent == "career":
        result = career_agent(message)
    else:
        result = "Sorry, I couldn't understand that request."

    return {"agent": intent, "response": result}