# Deck Generator 2.0

**Deck Generator 2.0** is an internal Google Apps Script web app built to streamline the creation of custom workspace proposal decks for CIC's sales and relationship management team. The tool automates the generation of Google Slides presentations based on user-selected workspace data, cutting proposal creation time from 30–45 minutes down to approximately 3–5 minutes.

---

## 🚀 Features

- **Web-based interface** (via Google Apps Script Web App) for selecting workspaces
- **Dynamic slide generation** using the Google Slides API
- **Data integration** via internal workspace management API
- **Automatic population** of floor plans, images, workspace details, pricing, and user-specific contact info
- **Editable output**: Generates a Google Slides deck that can be modified before exporting as a client-facing PDF

---

## 🧰 Tech Stack

- **Google Apps Script**
- **Google Slides, Sheets, and Drive APIs**
- **Google Apps Script Web App**
- **Private REST API** for workspace data integration

---

## 🔒 Access & Authentication

This tool is internal-only and not publicly deployed. API keys and workspace credentials are secured via Google Workspace OAuth and scoped to internal usage.

**Note**: This repository contains anonymized and redacted code. API endpoints and sensitive identifiers have been removed or obfuscated.

---

## 🛠 Example Workflow

1. A relationship manager logs into the Deck Generator web app.
2. They select a list of workspaces shown during a sales tour.
3. The tool fetches corresponding:
   - Photos and floorplans from Google Drive
   - Pricing and descriptions from the internal API
   - User contact info from a managed roster (Google Sheets)
4. The app generates a fully editable Google Slides deck with all content preloaded.
5. The user makes final edits (if needed) and exports the PDF to share with the prospective client.

---

## 📦 Repository Contents

- `/Code.gs` — Core Apps Script logic and UI handling
- `/HtmlService.html` — Web app front end
- `/ApiService.gs` — Backend API integration
- `/DriveService.gs` — File fetching and formatting from Google Drive
- `/SlideGenerator.gs` — Logic for dynamically inserting slides, images, and text
- `/config/` — Sample structure for maintaining workspace IDs and sheet mappings (redacted)

---

## 📄 License

This code is shared for reference under the MIT License, with all proprietary identifiers removed. Please do not reuse without proper anonymization and respect for internal security.

---

## 🙋‍♂️ Author

Built and maintained by [Ezra Rabinsky](https://www.linkedin.com/in/ezra-rabinsky-828629184), Sales Systems Lead at CIC.

