# Farmer Attendance & Wage Tracker

A simple, offline-first web application designed for farmers to manage worker attendance and daily wages directly from the browser.

---

## Features

### Worker Management

* Add new workers
* Define daily wages
* Edit worker details

### Attendance Tracking

* Mark attendance for each worker per day:

  * Full Day
  * Half Day (50% wage)
  * Absent
  * Extra (custom amount)

* One record per worker per day

* Editable (overwrites previous entry)

### Wage Calculation Logic

* Full → 100% wage
* Half → 50% wage
* Absent → 0
* Extra → custom amount (replaces wage)

---

### Built-in Calculator

* Perform quick calculations inside the app
* Supports:

  * * * /

---

### Offline Storage

* Uses IndexedDB
* Data persists after:

  * Page refresh
  * Browser restart

---

## UI Design

* Mobile-friendly layout
* Table-based quick attendance entry
* Large action buttons for ease of use

---

## Tech Stack

* HTML
* CSS
* JavaScript (Vanilla)
* IndexedDB

---

## Project Structure

```
project-folder/
│
├── index.html   # Main application file
```

---

## How to Run

1. Clone the repository:

   ```
   git clone https://github.com/your-username/farm-attendance.git
   ```

2. Open the project folder

3. Open:

   ```
   index.html
   ```

No installation required
No internet required

---

## Deployment (GitHub Pages)

1. Go to repository → Settings → Pages
2. Select:

   * Branch: main
   * Folder: root
3. Save

Your app will be available at:

```
https://your-username.github.io/farm-attendance/
```

---

## Limitations

* Data is stored locally (device-specific)
* No cloud backup
* Clearing browser data will erase records

---

## Future Enhancements

* Worker reports with date range filtering
* Total wage calculation
* Backup and restore (JSON export/import)
* Progressive Web App (PWA)
* Multi-language support

---

## Contribution

Contributions are welcome for improvements and feature additions.

---

## License

Free to use for educational and personal purposes.

---

## Author

Developed for practical agricultural workforce management.
