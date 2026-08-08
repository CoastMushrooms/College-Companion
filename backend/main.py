from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from auth import get_db, get_current_user
from fastapi import UploadFile, File, Form
from datetime import date, timedelta
from pypdf import PdfReader
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import io
import rag
import models as models
import schemas
import crud as crud
import auth as auth
import agents
import ai

app = FastAPI()

MAX_FILE_SIZE = 10 * 1024 * 1024
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, college companion"}

@app.get("/health")
def health_check():
    return {"status": "OK"}

@app.post("/courses")
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_course(db, course, current_user.id)

@app.get("/courses")
def list_courses(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_courses(db, current_user.id)

@app.get("/courses/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    course = crud.get_course(db, course_id, current_user.id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.put("/courses/{course_id}")
def update_course(course_id: int, updated_course: schemas.CourseUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    course = crud.update_course(db, course_id, updated_course, current_user.id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.delete("/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    course = crud.delete_course(db, course_id, current_user.id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": f"Course {course_id} deleted"}

@app.get("/courses/{course_id}/assignments")
def get_assignments_by_course(course_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_assignments_by_course(db, course_id, current_user.id)

@app.get("/courses/{course_id}/notes")
def get_notes_by_course(course_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_notes_by_course(db, course_id, current_user.id)

@app.post("/assignments")
def create_assignment(assignment: schemas.AssignmentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_assignment(db, assignment, current_user.id)

@app.get("/assignments")
def list_assignments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_assignments(db, current_user.id)

@app.get("/assignments/{assignment_id}")
def get_assignment(assignment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    assignment = crud.get_assignment(db, assignment_id, current_user.id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

@app.put("/assignments/{assignment_id}")
def update_assignment(assignment_id: int, updated_assignment: schemas.AssignmentUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    assignment = crud.update_assignment(db, assignment_id, updated_assignment, current_user.id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

@app.delete("/assignments/{assignment_id}")
def delete_assignment(assignment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    assignment = crud.delete_assignment(db, assignment_id, current_user.id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"message": f"Assignment {assignment_id} deleted"}

@app.post("/notes")
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_note(db, note, current_user.id)

@app.get("/notes")
def list_notes(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_notes(db, current_user.id)

@app.get("/notes/{note_id}")
def get_note(note_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    note = crud.get_note(db, note_id, current_user.id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@app.put("/notes/{note_id}")
def update_note(note_id: int, updated_note: schemas.NoteUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    note = crud.update_note(db, note_id, updated_note, current_user.id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    note = crud.delete_note(db, note_id, current_user.id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": f"Note {note_id} deleted"}

@app.post("/notes/{note_id}/flashcards", response_model=list[schemas.FlashcardOut])
def generate_and_save_flashcards(note_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    note = crud.get_note(db, note_id, current_user.id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")

    generated = ai.generate_flashcards(note.content)
    return crud.create_flashcards(db, note_id, current_user.id, generated)

@app.get("/notes/{note_id}/flashcards", response_model=list[schemas.FlashcardOut])
def get_flashcards(note_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_flashcards_by_note(db, note_id, current_user.id)

@app.post("/notes/{note_id}/quiz", response_model=list[schemas.QuizOut])
def generate_and_save_quiz(note_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    note = crud.get_note(db, note_id, current_user.id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")

    generated = ai.generate_quiz(note.content)
    return crud.create_quiz(db, note_id, current_user.id, generated)

@app.get("/notes/{note_id}/quiz", response_model=list[schemas.QuizOut])
def get_quiz(note_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_quiz_by_note(db, note_id, current_user.id)

@app.post("/register", response_model=schemas.UserOut)
@limiter.limit("3/minute")
def register(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)

@app.post("/login")
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, form_data.username)
    if user is None:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if crud.is_locked(user):
        raise HTTPException(status_code=423, detail="Account locked due to too many failed attempts. Try again in 15 minutes.")

    if not auth.verify_password(form_data.password, user.hashed_password):
        crud.record_failed_login(db, user)
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    crud.reset_failed_logins(db, user)
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_dashboard(db, current_user.id)

@app.get("/calendar")
def calendar(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_calendar(db, current_user.id)

@app.post("/flashcards", response_model=list[schemas.Flashcard])
@limiter.limit("10/minute")
def flashcards(request: Request, body: schemas.FlashcardRequest, current_user: models.User = Depends(get_current_user)):
    return ai.generate_flashcards(body.content)

@app.get("/flashcards/all", response_model=list[schemas.FlashcardOut])
def get_all_flashcards(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_all_flashcards(db, current_user.id)

@app.post("/quiz", response_model=list[schemas.QuizQuestion])
@limiter.limit("10/minute")
def quiz(request: Request, body: schemas.QuizRequest, current_user: models.User = Depends(get_current_user)):
    return ai.generate_quiz(body.content)

@app.post("/explain", response_model=schemas.ExplainResponse)
@limiter.limit("10/minute")
def explain(request: Request, body: schemas.ExplainRequest, current_user: models.User = Depends(get_current_user)):
    explanation = ai.explain_concept(body.concept, body.style)
    return {"explanation": explanation}

@app.get("/planner", response_model=schemas.StudyPlanResponse)
def planner(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    assignments = crud.get_assignments(db, current_user.id)
    assignments_data = [
        {"title": a.title, "due_date": a.due_date, "priority": a.priority, "status": a.status}
        for a in assignments if a.status != "done"
    ]
    plan = ai.generate_study_plan(assignments_data)
    return {"plan": plan}

@app.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    course_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    reader = PdfReader(io.BytesIO(contents))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""

    document = crud.create_document(db, file.filename, course_id, current_user.id)

    chunks = rag.chunk_text(text)
    rag.add_document_to_vector_store(chunks, document.id, current_user.id, course_id, file.filename)

    return {"message": "Document uploaded and processed", "document_id": document.id, "chunks_created": len(chunks)}

@app.get("/documents", response_model=list[schemas.DocumentOut])
def list_documents(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_documents(db, current_user.id)

@app.post("/documents/{document_id}/flashcards", response_model=list[schemas.FlashcardOut])
def generate_and_save_document_flashcards(document_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    documents = crud.get_documents(db, current_user.id)
    if not any(d.id == document_id for d in documents):
        raise HTTPException(status_code=404, detail="Document not found")

    text = rag.get_document_text(document_id, current_user.id)
    if not text.strip():
        raise HTTPException(status_code=400, detail="No content found for this document")

    generated = ai.generate_flashcards(text)
    return crud.create_flashcards_for_document(db, document_id, current_user.id, generated)

@app.get("/documents/{document_id}/flashcards", response_model=list[schemas.FlashcardOut])
def get_document_flashcards(document_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_flashcards_by_document(db, document_id, current_user.id)

@app.delete("/documents/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    doc = crud.delete_document(db, document_id, current_user.id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    rag.delete_document_from_vector_store(document_id, current_user.id)
    return {"message": "Document deleted"}

@app.post("/rag/query", response_model=schemas.RAGQueryResponse)
@limiter.limit("10/minute")
def rag_query(request: Request, body: schemas.RAGQueryRequest, current_user: models.User = Depends(get_current_user)):
    return rag.query_documents(body.question, current_user.id)

@app.post("/study-sessions", response_model=schemas.StudySessionOut)
def create_study_session(session: schemas.StudySessionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_study_session(db, session, current_user.id)

@app.get("/study-sessions", response_model=list[schemas.StudySessionOut])
def list_study_sessions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_study_sessions(db, current_user.id)

@app.get("/analytics", response_model=schemas.AnalyticsResponse)
def analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_analytics(db, current_user.id)

@app.get("/deadline-warning", response_model=schemas.DeadlineWarningResponse)
def deadline_warning(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_deadline_warning(db, current_user.id)

@app.post("/agent", response_model=schemas.AgentResponse)
@limiter.limit("10/minute")
def agent_request(request: Request, body: schemas.AgentRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    assignments = crud.get_assignments(db, current_user.id)
    assignments_context = "\n".join(
        f"- {a.title} (due {a.due_date}, status {a.status})" for a in assignments if a.status != "done"
    )
    return agents.route_to_agent(body.message, current_user.id, assignments_context)

@app.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email)
    if user:
        token = crud.create_reset_token(db, user)
        print(f"[DEV] Password reset link: http://localhost:5173/reset-password?token={token}")
    return {"message": "If that email exists, a reset link has been sent"}

@app.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    success = crud.reset_password(db, token, new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    return {"message": "Password reset successful"}

@app.put("/account", response_model=schemas.UserOut)
def update_account(data: schemas.AccountUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.update_account(db, current_user, data)