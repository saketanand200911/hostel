# CampusHaven Hostel Portal

CampusHaven is a student hostel management website for residents, wardens, and administrators. It provides a friendly hostel dashboard with gate passes, meal menus, maintenance requests, notices, emergency contacts, and weekly timetables.

## Website Features

- Resident, warden, and admin login flows with offline demo support
- Personalized greeting after login
- Digital QR gate pass with room and resident details
- Daily food menu and weekly meal timetable
- Meal feedback with star rating, description, and optional attachment
- Date-aware menu selection using the `Asia/Kolkata` timezone
- `SERVED`, `UPCOMING`, and `LATER` meal status labels based on local time
- Weekly academic and residence timetable
- Maintenance tickets, leave requests, mess feedback, and parcel status
- Notices, help desk contacts, emergency numbers, and hostel rules
- Boys and girls hostel themes with institution selection

## Standalone Website Files

The directly openable website is made from three connected files:

- `index.html` contains the page structure and content.
- `hostel.css` contains the custom styling and themes.
- `hostel.js` contains the browser JavaScript for navigation, login, menus, QR passes, modals, and API calls.

Open `index.html` directly in a browser for the standalone experience. The standalone page uses the backend at `http://localhost:4000/api` when opened as a local file.

## React Frontend

The modern React implementation is in `campushaven/frontend`.

```bash
cd campushaven/frontend
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Backend

The Express backend is in `campushaven/backend`. It stores calendar metadata and date-specific menus in `calendar-data.json`.

```bash
cd campushaven/backend
npm install
npm start
```

The server runs on `http://localhost:4000` by default.

### Google Login and Welcome Email

Google login uses the backend OAuth callback at:

`http://localhost:4000/api/auth/google/callback`

Create a Google OAuth web client and add that callback URL to its authorized redirect URIs. Start the backend with these environment variables:

```bash
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"
export GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"
export GOOGLE_RETURN_URL="http://localhost:3000/login"
export SMTP_HOST="smtp.example.com"
export SMTP_PORT="587"
export SMTP_USER="your-smtp-user"
export SMTP_PASS="your-smtp-password"
export SMTP_FROM="CampusHaven <no-reply@example.com>"
npm start
```

After the user approves Google access, the backend verifies the Google profile, creates a one-time login session, and sends a welcome email to the verified Google email address. `SMTP_SECURE=true` can be used for SMTP providers that require TLS from connection start. Without Google or SMTP variables, the UI reports that the service is not configured rather than pretending a login or email succeeded.

## Calendar and Menu API

Useful endpoints:

- `GET /api/health` checks server availability.
- `GET /api/time` returns the current date and time for `Asia/Kolkata`.
- `GET /api/calendar` returns the saved calendar record.
- `GET /api/calendar/menu?date=YYYY-MM-DD` returns the menu for a date.
- `POST /api/calendar` saves calendar data and date-specific menus.

Example menu upload:

```json
{
	"menuByDate": {
		"2026-09-24": {
			"breakfast": ["Plain Paratha", "Aloo Sabji", "Tea"],
			"lunch": ["Chapathi", "Veg Biryani", "Boondi Raita"],
			"snacks": ["Aloo Samosa", "Imli Chutney"],
			"dinner": ["Chapathi", "Achari Seasonal Veg", "Gulab Jamun"]
		}
	},
	"menuByDay": {
		"Friday": {
			"breakfast": ["Poha", "Tea"],
			"lunch": ["Chapathi", "Dal", "Rice"],
			"snacks": ["Samosa"],
			"dinner": ["Roti", "Seasonal Vegetable"]
		}
	}
}
```

Exact `menuByDate` entries take priority; otherwise the matching `menuByDay` entry is used. All menu date keys and displayed meal times use GMT+5:30 through the `Asia/Kolkata` timezone.
