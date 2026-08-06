from pydantic import BaseModel

class CourseCreate(BaseModel):
    name: str
    professor: str
    credits: int
    
class CourseUpdate(BaseModel):
    name: str
    professor: str
    credits: int
    
class AssignmentCreate(BaseModel):
    title: str
    due_date: str
    priority: int
    course_id: int
    status: str = "not_started"

class AssignmentUpdate(BaseModel):
    title: str
    due_date: str
    priority: int
    status: str
    course_id: int
    
class NoteCreate(BaseModel):
    title: str
    content: str
    course_id: int

class NoteUpdate(BaseModel):
    title: str
    content: str
    course_id: int
    
class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True
        
class FlashcardRequest(BaseModel):
    content: str

class Flashcard(BaseModel):
    question: str
    answer: str
    
class FlashcardOut(BaseModel):
    id: int
    question: str
    answer: str
    note_id: int | None = None
    document_id: int | None = None

    class Config:
        from_attributes = True

class QuizRequest(BaseModel):
    content: str

class QuizQuestion(BaseModel):
    type: str
    question: str
    options: list[str] | None = None
    answer: str
    
class QuizOut(BaseModel):
    id: int
    type: str
    question: str
    options: str | None
    answer: str
    note_id: int

    class Config:
        from_attributes = True

class ExplainRequest(BaseModel):
    concept: str
    style: str = "freshman"

class ExplainResponse(BaseModel):
    explanation: str
    
class StudyPlanResponse(BaseModel):
    plan: str

class DocumentOut(BaseModel):
    id: int
    filename: str
    course_id: int

    class Config:
        from_attributes = True

class RAGQueryRequest(BaseModel):
    question: str

class RAGQueryResponse(BaseModel):
    answer: str
    sources: list[str]
    
class StudySessionCreate(BaseModel):
    duration_minutes: int
    course_id: int | None = None

class StudySessionOut(BaseModel):
    id: int
    duration_minutes: int
    course_id: int | None
    completed_at: str

    class Config:
        from_attributes = True
        
class DayHours(BaseModel):
    date: str
    hours: float

class AnalyticsResponse(BaseModel):
    total_study_minutes: int
    total_study_hours: float
    hours_by_day: list[DayHours]
    total_assignments: int
    completed_assignments: int
    completion_rate: float
    
class DeadlineWarningResponse(BaseModel):
    at_risk: bool
    assignments_due_this_week: int
    estimated_hours_needed: int
    message: str
    
class AgentRequest(BaseModel):
    message: str

class AgentResponse(BaseModel):
    agent: str
    response: str | list | dict