# ⚡ Full-Stack Engineering Portfolio & Technical Notes Platform

> **Live Deployment:** [https://dev-portfolio-hgbk.onrender.com/](https://dev-portfolio-hgbk.onrender.com/)  
> *Crafted to showcase production systems, machine learning workflows, and technical writing without framework overhead.*

[![Live Site](https://img.shields.io/badge/Live_Site-Visit_Now-38bdf8?style=for-the-badge&logo=render&logoColor=white)](https://dev-portfolio-hgbk.onrender.com/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 💡 Why This Exists

Most portfolio templates rely on bulky frontend frameworks or static site generators where updating content means pushing commits and triggering slow redeploy pipelines. 

I built this project with a different philosophy: **engineer a lean, reliable web application from the ground up.** It combines an asynchronous Python REST API with a zero-dependency, glassmorphic client interface that loads instantly on any phone, tablet, or workstation. Visitors browse seamlessly in a distraction-free Guest mode, while I can log into the authenticated console from anywhere to publish technical write-ups and project retrospectives in real time.

---

## 🏛️ System Architecture

```
                      +---------------------------------------+
                      |         Global Web Traffic            |
                      |    (Recruiters, Engineers, Guests)    |
                      +---------------------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |       Render Edge Proxy / SSL         |
                      | (https://dev-portfolio-hgbk.onrender) |
                      +---------------------------------------+
                                          |
                      +---------------------------------------+
                      |      Uvicorn ASGI Server (FastAPI)    |
                      +---------------------------------------+
                               /                     \
                              v                       v
               +-----------------------+     +-----------------------+
               |    Static Frontend    |     |     REST API Layer    |
               | (HTML5 / CSS3 / ES6)  |     | (/api/projects, posts)|
               +-----------------------+     +-----------------------+
                                                         |
                                             JWT & bcrypt Validation
                                                         |
                                                         v
                                             +-----------------------+
                                             |  SQLAlchemy ORM Layer |
                                             +-----------------------+
                                                         |
                                                         v
                                             +-----------------------+
                                             |  SQLite Database      |
                                             +-----------------------+
```

---

## ✨ Highlights & Engineering Decisions

* **Distraction-Free Guest Mode by Default:** No blocking login walls or intrusive popups. Recruiters and peer developers land directly on the portfolio to inspect systems work and publication drafts without friction.
* **Token-Guarded CMS Pipeline:** Admin access uses raw `bcrypt` hashing (handling strict 72-byte buffer limits) coupled with signed HMAC-SHA256 JWT tokens. Unauthorized mutation attempts (`POST`, `DELETE`) are blocked at both client and server boundaries.
* **Zero-Framework Performance:** Hand-rolled using vanilla ES6 JavaScript, modern CSS Grid, and custom CSS variables. With no virtual DOM hydration lag, First Contentful Paint (FCP) is near instantaneous.
* **Inline Dynamic Reader:** Readers can expand technical implementations and deep dives in-place with smooth collapsible toggles (`View More &rarr;` / `Show Less &uarr;`), keeping browse flow cohesive.
* **Looping Typewriter Engine:** Custom asynchronous text cycling that highlights software engineering, distributed APIs, and AI/ML specializations without pulling in external npm libraries.

---

## 🛠️ Tech Stack & Tooling

| Component | Choice | Rationale |
| :--- | :--- | :--- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+) | Asynchronous request handling, built-in validation via Pydantic, and OpenAPI generation. |
| **ASGI Engine** | [Uvicorn](https://www.uvicorn.org/) | Concurrent, low-latency execution optimized for microservices. |
| **Persistence** | [SQLite](https://www.sqlite.org/) + [SQLAlchemy 2.0](https://www.sqlalchemy.org/) | Self-contained, robust SQL relational modeling without infrastructure bloat. |
| **Auth & Cryptography** | `bcrypt` + `python-jose` | Modern password hashing paired with secure, stateless JSON Web Tokens. |
| **Frontend Core** | HTML5, CSS3 Glassmorphism, Vanilla JS | Lightweight, standard web APIs ensuring cross-device adaptability. |
| **Cloud Hosting** | [Render](https://render.com/) | Containerized cloud deployment with automated GitHub CI/CD webhooks. |

---

## 📂 Repository Structure

```text
dev-portfolio/
│
├── backend/
│   ├── __init__.py
│   ├── main.py            # API routing, CORS policies & static mounts
│   ├── auth.py            # JWT token creation, decoding & bcrypt hashing
│   ├── database.py        # SQLAlchemy engine and connection session makers
│   ├── models.py          # Database schema (User, Project, Post tables)
│   └── schemas.py         # Pydantic validation and serializing models
│
├── frontend/
│   ├── index.html         # Semantic single-page layout & accessible structure
│   ├── style.css          # Glassmorphic styling, fluid typography & CSS Grid
│   └── app.js             # Client-side state, typewriter logic & API fetchers
│
├── requirements.txt       # Pinned production dependencies
├── .gitignore             # Environment and local cache rules
└── README.md              # Project documentation
```

---

## 🔌 API Reference

### Public Routes (Unrestricted)

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Serves the web interface (`frontend/index.html`) |
| `GET` | `/api/projects` | Retrieves published technical projects (ordered by recency) |
| `GET` | `/api/posts` | Retrieves published architecture notes and engineering articles |

### Protected Routes (Admin Bearer Token Required)

| Method | Route | Security | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/token` | Public | Authenticates admin credentials and returns an access token |
| `POST` | `/api/projects` | `Bearer JWT` | Adds a new technical implementation to the database |
| `DELETE` | `/api/projects/{id}` | `Bearer JWT` | Removes a project by primary key ID |
| `POST` | `/api/posts` | `Bearer JWT` | Publishes a new engineering publication |
| `DELETE` | `/api/posts/{id}` | `Bearer JWT` | Removes an engineering publication by ID |

---

## 🚀 Local Development Setup

To run and test the project locally on your machine:

### 1. Clone & Navigate
```bash
git clone https://github.com/SnehaChowdhur/dev-portfolio.git
cd dev-portfolio
```

### 2. Configure Virtual Environment
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows (Command Prompt / PowerShell)
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Development Server
```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) to view the live interface.  
Interactive OpenAPI documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 🌐 Production Deployment (Render)

This repository is optimized for quick deployment on Render:

1. Connect your GitHub repository to [Render](https://render.com/).
2. Select **Web Service** with the **Python 3** environment.
3. Configure the commands:
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Set an environment variable:
   * `SECRET_KEY`: `<your-random-cryptographic-secret>`
5. Deploy. Updates pushed to the `main` branch trigger automated redeployments.

---

## 📄 License

Distributed under the MIT License. Feel free to use this architecture as an inspiration for building your own performant portfolio.
