# Apex WordPress (Headless CMS)

Containerized WordPress instance running our custom **`apex-core`** plugin.
WordPress is the system-of-record for marketing content (ACF Pro), authenticated
shop-owner accounts (JWT), and forwards lead submissions to the FastAPI Logic
Engine.

## Layout

```
services/wordpress/
├── plugin-apex-core/          # Bind-mounted into wp-content/plugins
│   ├── apex-core.php          # Plugin bootstrap (CPTs, REST routes, JWT)
│   └── includes/
│       ├── class-apex-cpts.php       # Leads / Vehicles / Work_Orders CPTs
│       ├── class-apex-rest.php       # REST surface: /wp-json/apex/v1/...
│       └── class-apex-jwt.php        # JWT issuance/verification helpers
└── config/
    └── uploads.ini            # PHP upload tuning
```

## Custom Post Types

| CPT          | Purpose                                                           |
| ------------ | ----------------------------------------------------------------- |
| `apex_lead`  | Mirror of the Logic Engine's lead store; ACF Pro fields           |
| `apex_vehicle` | Vehicle records linked to leads / work orders                   |
| `apex_work_order` | Service jobs; status drives review-request automation        |

## REST Endpoints (namespace `apex/v1`)

| Method | Path                | Auth     | Purpose                                          |
| ------ | ------------------- | -------- | ------------------------------------------------ |
| POST   | `/lead`             | Public   | Receives public-site form, forwards to FastAPI   |
| POST   | `/auth/login`       | Public   | Issues JWT for dashboard access                  |
| GET    | `/auth/me`          | JWT      | Returns the current dashboard user               |

## Local

The container is brought up by the root `docker-compose.yml`. ACF Pro is
**required** in production but isn't redistributable here — drop the plugin zip
into `services/wordpress/plugins-bundled/` before `docker compose up`.
