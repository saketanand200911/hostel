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

- `hostel.html` contains the page structure and content.
- `hostel.css` contains the custom styling and themes.
- `hostel.jsx` contains the browser JavaScript for navigation, login, menus, QR passes, modals, and API calls.

Open `hostel.html` directly in a browser for the standalone experience. The standalone page uses the backend at `http://localhost:4000/api` when opened as a local file.

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
	}
}
```

All menu date keys and displayed meal times use GMT+5:30 through the `Asia/Kolkata` timezone.
