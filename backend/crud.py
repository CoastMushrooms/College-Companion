from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
import models as models
import schemas
import auth as auth
import json
from collections import Counter
import secrets

def get_courses(db: Session, user_id: int):
    return db.query(models.Course).filter(models.Course.user_id == user_id).all()

def get_course(db: Session, course_id: int, user_id: int):
    return db.query(models.Course).filter(
        models.Course.id == course_id,
        models.Course.user_id == user_id
    ).first()

def create_course(db: Session, course: schemas.CourseCreate, user_id: int):
    new_course = models.Course(
        name=course.name,
        professor=course.professor,
        credits=course.credits,
        user_id=user_id
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

def update_course(db: Session, course_id: int, updated_course: schemas.CourseUpdate, user_id: int):
    course = get_course(db, course_id, user_id)
    if course is None:
        return None
    course.name = updated_course.name
    course.professor = updated_course.professor
    course.credits = updated_course.credits
    db.commit()
    db.refresh(course)
    return course

def delete_course(db: Session, course_id: int, user_id: int):
    course = get_course(db, course_id, user_id)
    if course is None:
        return None
    db.delete(course)
    db.commit()
    return course

def get_assignments(db: Session, user_id: int):
    return db.query(models.Assignment).filter(models.Assignment.user_id == user_id).all()

def get_assignment(db: Session, assignment_id: int, user_id: int):
    return db.query(models.Assignment).filter(
        models.Assignment.id == assignment_id,
        models.Assignment.user_id == user_id
    ).first()
    
def get_assignments_by_course(db: Session, course_id: int, user_id: int):
    return db.query(models.Assignment).filter(
        models.Assignment.course_id == course_id,
        models.Assignment.user_id == user_id
    ).all()

def create_assignment(db: Session, assignment: schemas.AssignmentCreate, user_id: int):
    new_assignment = models.Assignment(
        title=assignment.title,
        due_date=assignment.due_date,
        priority=assignment.priority,
        status=assignment.status,
        course_id=assignment.course_id,
        user_id=user_id
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

def update_assignment(db: Session, assignment_id: int, updated_assignment: schemas.AssignmentUpdate, user_id: int):
    assignment = get_assignment(db, assignment_id, user_id)
    if assignment is None:
        return None
    assignment.title = updated_assignment.title
    assignment.due_date = updated_assignment.due_date
    assignment.priority = updated_assignment.priority
    assignment.status = updated_assignment.status
    assignment.course_id = updated_assignment.course_id
    db.commit()
    db.refresh(assignment)
    return assignment

def delete_assignment(db: Session, assignment_id: int, user_id: int):
    assignment = get_assignment(db, assignment_id, user_id)
    if assignment is None:
        return None
    db.delete(assignment)
    db.commit()
    return assignment

def get_notes(db: Session, user_id: int):
    return db.query(models.Note).filter(models.Note.user_id == user_id).all()

def get_note(db: Session, note_id: int, user_id: int):
    return db.query(models.Note).filter(
        models.Note.id == note_id,
        models.Note.user_id == user_id
    ).first()

def get_notes_by_course(db: Session, course_id: int, user_id: int):
    return db.query(models.Note).filter(
        models.Note.course_id == course_id,
        models.Note.user_id == user_id
    ).all()

def create_note(db: Session, note: schemas.NoteCreate, user_id: int):
    new_note = models.Note(
        title=note.title,
        content=note.content,
        course_id=note.course_id,
        user_id=user_id
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

def update_note(db: Session, note_id: int, updated_note: schemas.NoteUpdate, user_id: int):
    note = get_note(db, note_id, user_id)
    if note is None:
        return None
    note.title = updated_note.title
    note.content = updated_note.content
    note.course_id = updated_note.course_id
    db.commit()
    db.refresh(note)
    return note

def delete_note(db: Session, note_id: int, user_id: int):
    note = get_note(db, note_id, user_id)
    if note is None:
        return None
    db.delete(note)
    db.commit()
    return note

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.hash_password(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_dashboard(db: Session, user_id: int):
    today_str = str(date.today())

    upcoming_assignments = db.query(models.Assignment).filter(
        models.Assignment.user_id == user_id,
        models.Assignment.status != "done"
    ).order_by(models.Assignment.due_date).limit(5).all()

    todays_assignments = db.query(models.Assignment).filter(
        models.Assignment.user_id == user_id,
        models.Assignment.due_date == today_str
    ).all()

    return {
        "upcoming_assignments": upcoming_assignments,
        "todays_tasks": todays_assignments
    }
    
def get_calendar(db: Session, user_id: int):
    assignments = db.query(models.Assignment).filter(
        models.Assignment.user_id == user_id
    ).all()

    events = []
    for assignment in assignments:
        events.append({
            "id": assignment.id,
            "title": assignment.title,
            "date": assignment.due_date,
            "type": "assignment",
            "status": assignment.status
        })

    return events

def get_flashcards_by_note(db: Session, note_id: int, user_id: int):
    return db.query(models.Flashcard).filter(
        models.Flashcard.note_id == note_id,
        models.Flashcard.user_id == user_id
    ).all()

def create_flashcards(db: Session, note_id: int, user_id: int, flashcards: list):
    new_flashcards = []
    for card in flashcards:
        new_card = models.Flashcard(
            question=card["question"],
            answer=card["answer"],
            note_id=note_id,
            user_id=user_id
        )
        db.add(new_card)
        new_flashcards.append(new_card)
    db.commit()
    for card in new_flashcards:
        db.refresh(card)
    return new_flashcards

def get_all_flashcards(db: Session, user_id: int):
    return db.query(models.Flashcard).filter(models.Flashcard.user_id == user_id).all()

def get_quiz_by_note(db: Session, note_id: int, user_id: int):
    return db.query(models.Quiz).filter(
        models.Quiz.note_id == note_id,
        models.Quiz.user_id == user_id
    ).all()

def create_quiz(db: Session, note_id: int, user_id: int, questions: list):
    new_questions = []
    for q in questions:
        options_str = json.dumps(q["options"]) if q.get("options") else None
        new_q = models.Quiz(
            type=q["type"],
            question=q["question"],
            options=options_str,
            answer=q["answer"],
            note_id=note_id,
            user_id=user_id
        )
        db.add(new_q)
        new_questions.append(new_q)
    db.commit()
    for q in new_questions:
        db.refresh(q)
    return new_questions

def create_document(db: Session, filename: str, course_id: int, user_id: int):
    doc = models.Document(filename=filename, course_id=course_id, user_id=user_id)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

def get_documents(db: Session, user_id: int):
    return db.query(models.Document).filter(models.Document.user_id == user_id).all()

def create_study_session(db: Session, session: schemas.StudySessionCreate, user_id: int):
    new_session = models.StudySession(
        duration_minutes=session.duration_minutes,
        course_id=session.course_id,
        user_id=user_id
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

def get_study_sessions(db: Session, user_id: int):
    return db.query(models.StudySession).filter(models.StudySession.user_id == user_id).all()

def get_analytics(db: Session, user_id: int):
    sessions = get_study_sessions(db, user_id)
    assignments = get_assignments(db, user_id)

    total_minutes = sum(s.duration_minutes for s in sessions)

    hours_by_day = Counter()
    for s in sessions:
        day = s.completed_at[:10]
        hours_by_day[day] += s.duration_minutes / 60

    total_assignments = len(assignments)
    completed_assignments = len([a for a in assignments if a.status == "done"])
    completion_rate = (completed_assignments / total_assignments * 100) if total_assignments > 0 else 0

    return {
        "total_study_minutes": total_minutes,
        "total_study_hours": round(total_minutes / 60, 1),
        "hours_by_day": [{"date": day, "hours": round(hours, 2)} for day, hours in sorted(hours_by_day.items())],
        "total_assignments": total_assignments,
        "completed_assignments": completed_assignments,
        "completion_rate": round(completion_rate, 1)
    }
    
def get_deadline_warning(db: Session, user_id: int):
    assignments = get_assignments(db, user_id)
    today = date.today()
    week_from_now = today + timedelta(days=7)

    upcoming_undone = [
        a for a in assignments
        if a.status != "done" and today <= date.fromisoformat(a.due_date) <= week_from_now
    ]

    total_hours_needed = len(upcoming_undone) * 3
    available_study_hours = 14

    at_risk = total_hours_needed > available_study_hours

    return {
        "at_risk": at_risk,
        "assignments_due_this_week": len(upcoming_undone),
        "estimated_hours_needed": total_hours_needed,
        "message": (
            f"You have {len(upcoming_undone)} assignments due this week, you may fall behind."
            if at_risk else
            "You're on track for this week."
        )
    }
    
def create_flashcards_for_document(db: Session, document_id: int, user_id: int, flashcards: list):
    new_flashcards = []
    for card in flashcards:
        new_card = models.Flashcard(
            question=card["question"],
            answer=card["answer"],
            document_id=document_id,
            user_id=user_id
        )
        db.add(new_card)
        new_flashcards.append(new_card)
    db.commit()
    for card in new_flashcards:
        db.refresh(card)
    return new_flashcards

def get_flashcards_by_document(db: Session, document_id: int, user_id: int):
    return db.query(models.Flashcard).filter(
        models.Flashcard.document_id == document_id,
        models.Flashcard.user_id == user_id
    ).all()
    
def record_failed_login(db: Session, user: models.User):
    user.failed_attempts += 1
    if user.failed_attempts >= 5:
        user.locked_until = str(datetime.utcnow() + timedelta(minutes=15))
    db.commit()

def reset_failed_logins(db: Session, user: models.User):
    user.failed_attempts = 0
    user.locked_until = None
    db.commit()

def is_locked(user: models.User) -> bool:
    if user.locked_until is None:
        return False
    return datetime.fromisoformat(user.locked_until) > datetime.utcnow()

def delete_document(db: Session, document_id: int, user_id: int):
    doc = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.user_id == user_id
    ).first()
    if doc is None:
        return None
    db.delete(doc)
    db.commit()
    return doc

def create_reset_token(db: Session, user: models.User) -> str:
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = str(datetime.utcnow() + timedelta(hours=1))
    db.commit()
    return token

def reset_password(db: Session, token: str, new_password: str) -> bool:
    user = db.query(models.User).filter(models.User.reset_token == token).first()
    if user is None or datetime.fromisoformat(user.reset_token_expires) < datetime.utcnow():
        return False
    user.hashed_password = auth.hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return True

def update_account(db: Session, user: models.User, data: schemas.AccountUpdate):
    if data.email:
        user.email = data.email
    if data.password:
        user.hashed_password = auth.hash_password(data.password)
    db.commit()
    db.refresh(user)
    return user

def logout_everywhere(db: Session, user: models.User):
    user.token_version += 1
    db.commit()
    
def log_action(db: Session, user_id: int | None, action: str, detail: str = ""):
    entry = models.AuditLog(user_id=user_id, action=action, detail=detail)
    db.add(entry)
    db.commit()