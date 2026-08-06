import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

MODEL = "inclusionai/ling-3.0-tiny:free"

def summarize_notes(content: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": f"Summarize the following lecture notes into key concepts and main takeaways, in a concise study-friendly format:\n\n{content}"
            }
        ]
    )
    return response.choices[0].message.content

def generate_flashcards(content: str) -> list:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": (
                    "Generate 5 flashcards from the following notes. "
                    "Respond with ONLY a JSON array, no other text, no markdown formatting. "
                    "Each item must have exactly this shape: {\"question\": \"...\", \"answer\": \"...\"}\n\n"
                    f"Notes:\n{content}"
                )
            }
        ]
    )
    raw_text = response.choices[0].message.content
    cleaned = raw_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    flashcards = json.loads(cleaned)
    return flashcards

def generate_quiz(content: str) -> list:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": (
                    "Generate a 5-question quiz from the following notes, mixing multiple choice, "
                    "short answer, and fill-in-the-blank questions. "
                    "Respond with ONLY a JSON array, no other text, no markdown formatting. "
                    "Each item must have this shape: "
                    "{\"type\": \"multiple_choice\" | \"short_answer\" | \"fill_in_blank\", "
                    "\"question\": \"...\", \"options\": [\"...\"] or null, \"answer\": \"...\"}\n\n"
                    f"Notes:\n{content}"
                )
            }
        ]
    )
    raw_text = response.choices[0].message.content
    cleaned = raw_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    quiz = json.loads(cleaned)
    return quiz

def explain_concept(concept: str, style: str = "freshman") -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": f"Explain the following concept as if explaining to a {style}: {concept}"
            }
        ]
    )
    return response.choices[0].message.content

def generate_study_plan(assignments: list) -> str:
    assignments_text = "\n".join(
        f"- {a['title']} (due {a['due_date']}, priority {a['priority']}, status {a['status']})"
        for a in assignments
    )
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": (
                    "Given the following assignments, create a realistic day-by-day study plan "
                    "for the next 7 days, prioritizing by due date and priority. Be concise.\n\n"
                    f"{assignments_text}"
                )
            }
        ]
    )
    return response.choices[0].message.content