# Logic Engine (FastAPI)

Core middleware service for lead intake automation and lifecycle events.

## Endpoints

- `GET /healthz` - service health
- `POST /webhook/new-lead` - accepts standardized `Lead` payload and attempts SMS/Email follow-up
- `POST /webhook/status-update` - accepts status payload and sends review request when status is `completed`

## Run Locally

```bash
cd services/logic-engine
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
