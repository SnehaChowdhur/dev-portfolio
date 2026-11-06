from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import User, Project, Post
from .schemas import (
    ProjectCreate,
    ProjectResponse,
    PostCreate,
    PostResponse,
    Token,
)
from .auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_admin,
)

Base.metadata.create_all(bind=engine)


def seed_admin_user():
    db: Session = next(get_db())
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                hashed_password=get_password_hash("admin123"),
            )
            db.add(admin)
            db.commit()
        else:
            admin.hashed_password = get_password_hash("admin123")
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_admin_user()
    yield


app = FastAPI(title="Developer Portfolio & Blog API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth/token", response_model=Token)
async def login_for_access_token(
    request: Request,
    db: Session = Depends(get_db),
):
    content_type = request.headers.get("content-type", "")
    username = ""
    password = ""

    if "application/json" in content_type:
        body = await request.json()
        username = body.get("username", "")
        password = body.get("password", "")
    else:
        form = await request.form()
        username = form.get("username", "")
        password = form.get("password", "")

    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


# --- Public Read Endpoints (Anyone can view) ---
@app.get("/api/projects", response_model=List[ProjectResponse])
def get_all_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.created_at.desc()).all()


@app.get("/api/posts", response_model=List[PostResponse])
def get_all_posts(db: Session = Depends(get_db)):
    return db.query(Post).order_by(Post.created_at.desc()).all()


# --- Admin-Only Protected Endpoints (Strictly Authenticated) ---
@app.post("/api/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def add_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),  # Blocks non-admins with 401
):
    new_project = Project(**project_data.model_dump())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@app.post("/api/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def add_post(
    post_data: PostCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),  # Blocks non-admins with 401
):
    existing = db.query(Post).filter(Post.slug == post_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    new_post = Post(**post_data.model_dump())
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


@app.delete("/api/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),  # Blocks non-admins with 401
):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return None


@app.delete("/api/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_post(
    post_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),  # Blocks non-admins with 401
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return None


app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")