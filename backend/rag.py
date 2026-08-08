import chromadb
from chromadb.utils import embedding_functions
from ai import client, MODEL

chroma_client = chromadb.PersistentClient(path="./chroma_db")

embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = chroma_client.get_or_create_collection(
    name="documents",
    embedding_function=embedding_fn
)

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

def add_document_to_vector_store(chunks: list, document_id: int, user_id: int, course_id: int, filename: str):
    collection.add(
        documents=chunks,
        metadatas=[
            {"user_id": user_id, "document_id": document_id, "course_id": course_id, "filename": filename}
            for _ in chunks
        ],
        ids=[f"doc{document_id}-chunk{i}" for i in range(len(chunks))]
    )

def query_documents(query: str, user_id: int, n_results: int = 5) -> dict:
    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        where={"user_id": user_id}
    )

    retrieved_chunks = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []

    if not retrieved_chunks:
        return {"answer": "I couldn't find anything relevant in your uploaded documents.", "sources": []}

    context = "\n\n---\n\n".join(retrieved_chunks)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": (
                    "Answer the question using ONLY the context below. "
                    "If the answer isn't in the context, say you don't have that information.\n\n"
                    f"Context:\n{context}\n\nQuestion: {query}"
                )
            }
        ]
    )

    answer = response.choices[0].message.content
    sources = list(set(m["filename"] for m in metadatas))

    return {"answer": answer, "sources": sources}

def get_document_text(document_id: int, user_id: int) -> str:
    results = collection.get(
        where={"$and": [{"document_id": document_id}, {"user_id": user_id}]}
    )
    chunks = results["documents"]
    return "\n\n".join(chunks)

def delete_document_from_vector_store(document_id: int, user_id: int):
    collection.delete(where={"$and": [{"document_id": document_id}, {"user_id": user_id}]})